/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, JSONSerializer } from 'fabric-contract-api';
import { Election } from './models/election';
import { Position } from './models/position';
import { Participant } from './models/participant';
import { Shim, ChaincodeResponse } from 'fabric-shim';
import * as ShimApi from 'fabric-shim-api';
import { Candidate } from './models/candidate';
import { Vote } from './models/vote';
import { SendEmail } from './send_email';
import { CryptoStuff } from './crypto';
import { throws } from 'assert';
import { exception } from 'console';
import { EncryptedVote } from './models/encryptedVote';
import { Votes } from './models/votes';


export class ElectoralProcess extends Contract {

    public async initLedger(ctx: Context) {
        console.info('============= START : Initialize Ledger ===========');
        const election : Election =
        {
            docType: "election",
            name: "Diretoria 2020",
            candidacy_period_initial: new Date("2020-10-15T06:00:00"),
            candidacy_period_final: new Date("2020-10-19T12:00:00"),
            voting_period_initial: new Date("2020-10-19T12:01:00"),
            voting_period_final: new Date("2020-10-20T17:00:00")
        };

        const positions : Position[] = [
            {
                name: "Diretor Geral",
                electionNum: "ELECTION0",
                // election: election,
            },
            {
                name: "Coordenador",
                electionNum: "ELECTION0",
            }
        ];
        
        await ctx.stub.putState('ELECTION0', Buffer.from(JSON.stringify(election)));

        for (let i = 0; i < positions.length; i++) {
            positions[i].docType = 'position';
            await ctx.stub.putState('POSITION' + i, Buffer.from(JSON.stringify(positions[i])));
            console.info('Added <--> ', positions[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    public async createElection(ctx: Context, electionNumber: string, name: string, candidacy_period_initial: Date, candidacy_period_final: Date, voting_period_initial: Date, voting_period_final: Date) {
        console.info('============= START : Create Election ===========');        
        //verificar periodos (inicio candidatura tem que ser menor que fim candidatura...)
        //Como permitir que somente usuários admins utilizem essa função?
        
        if (!(candidacy_period_initial < candidacy_period_final 
        && candidacy_period_final <= voting_period_initial 
        && voting_period_initial < voting_period_final)){            
            throw new Error('Periodos da eleição estão incoerentes. A candidatura deve ser antes da votação, e a data inicio deve ser antes da final.');            
        }

        const election: Election =
        {
            docType: "election",
            name,
            candidacy_period_initial,
            candidacy_period_final,
            voting_period_initial,
            voting_period_final,
        };

        await ctx.stub.putState(electionNumber, Buffer.from(JSON.stringify(election)));
        console.info('============= END : Create Election ===========');
    }

    public async queryAsset(ctx: Context, key: string): Promise<string> {
        const assetAsBytes = await ctx.stub.getState(key);
        if (!assetAsBytes || assetAsBytes.length === 0) {
            throw new Error(`${key} does not exist`);
        }
        console.log(assetAsBytes.toString());
                
        // return "\nClientIdentity.getIDBytes " + ctx.clientIdentity.getIDBytes()  + " " +
        // "\n" + assetAsBytes.toString();
        return assetAsBytes.toString();
    }

    /**
     * queryAllElections
     */
    public async queryAllElections(ctx: Context):Promise<string> {
        var queryString = "{\"selector\":{\"docType\":\"election\"}}";
    
        try {
            var queryResults = this.getQueryResultForQueryString(ctx, queryString);
        } catch (err) {
            console.log(err);
            var resultErr =  Shim.error(err.Error());
            return "Message Err - " + resultErr.message + "  Payload - " + resultErr.payload.toString()
        }

        console.info(queryResults);
        return queryResults;        
    }

    public async queryAllPositionsByElection(ctx: Context, electionNum: string): Promise<string>{    
        var queryString = "{\"selector\":{\"docType\":\"position\",\"electionNum\":\"" + electionNum +"\"}}";
    
        try {
            var queryResults = this.getQueryResultForQueryString(ctx, queryString);
        } catch (err) {
            console.log(err);
            var resultErr =  Shim.error(err.Error());
            return "Message Err - " + resultErr.message + "  Payload - " + resultErr.payload.toString()
        }

        console.info(queryResults);
        return queryResults;
    }

    public async queryEncryptedVotesByElection(ctx: Context, electionNum: string): Promise<string>{    
        var queryString = "{\"selector\":{\"docType\":\"encryptedVote\",\"electionNum\":\"" + electionNum +"\"}}";
    
        try {
            var queryResults = this.getQueryResultForQueryString(ctx, queryString);
        } catch (err) {
            console.log(err);
            var resultErr =  Shim.error(err.Error());
            return "Message Err - " + resultErr.message + "  Payload - " + resultErr.payload.toString()
        }

        console.info(queryResults);
        return queryResults;
    }
    
    public async createPosition(ctx: Context, positionNumber: string, name: string, electionNumber: string) {
        console.info('============= START : Create Position ===========');
        //verificar se é update ou create - fazer um getAll por Election
        const electionResult = await this.queryAsset(ctx, electionNumber);
        const election: Election = JSON.parse(electionResult);
        console.log(electionResult);

        const position: Position = {
            name,
            docType: 'position',
            electionNum: electionNumber
        };

        await ctx.stub.putState(positionNumber, Buffer.from(JSON.stringify(position)));
        console.info('============= END : Create Position ===========');
    }

    public async createParticipant(ctx: Context, cpf: string, name: string, email: string) {
        console.info('============= START : Create Participant ===========');

        const assetAsBytes = await ctx.stub.getState(cpf);
        if (assetAsBytes && assetAsBytes.length > 0) {
            throw new Error(`The participant with CPF: ${cpf} has already been registered before.`);
        }

        const participant: Participant = {
            name,
            docType: 'participant',
            cpf,
            email,
        };

        //await ctx.stub.putState(participantNumber, Buffer.from(JSON.stringify(participant)));
        await ctx.stub.putState(cpf, Buffer.from(JSON.stringify(participant)));
        console.info('============= END : Create Participant ===========');
    }

    //send mail to confirm access
    public async requestCandidacy(ctx: Context, electionNum: string, key: string) {
        //verificar se já é um candidato.
        var participantKey = ctx.clientIdentity.getAttributeValue('cpf');
        const participantResult = await this.queryAsset(ctx, participantKey);
        const participant : Participant = JSON.parse(participantResult);

        let electionResult = await this.queryAsset(ctx, electionNum);
        let election: Election = JSON.parse(electionResult);

        if (await !this.isCandidacyTime(ctx, election)){
            throw new Error('The election is not on candidacy period.');
        }
        
        let idUint8Array = ctx.clientIdentity.getIDBytes();
        let crypto = new CryptoStuff();
        let hash = await crypto.sha256Hashing(idUint8Array.toString(), key);

        const assetAsBytes = await ctx.stub.getState(hash);
        if (assetAsBytes && assetAsBytes.length > 0) {
            throw new Error(`The candidate assigned for the key ${hash} has already registered as candidate for this election.`);
        }

        new SendEmail(            
            participant.email,
            'Request to candidacy - ' + election.name,
            '<p>Link to grant access to the candidate area - <a href="http://localhost:8080/api/candidacy/?token=' + hash +'&electionNum='+ electionNum +' "></a> </p>'
        ).sendMail();
    }

    /* back from email, the front end page should be returned and then, on the click of the front end page
    * this function could be called to finally put the state of the candidacy.
    */ 
    public async submitCandidate(ctx: Context, positionNumber: string, proposal: string) {
        //verificar se periodo de candidatura.
        //verificar se já se candidateu para algum position nessa election.
        
        //Create hash token again and check agains the hash token received from the email

        var participantKey = ctx.clientIdentity.getAttributeValue('cpf');
        const participantResult = await this.queryAsset(ctx, participantKey);
        const participant : Participant = JSON.parse(participantResult);

        const positionResult = await this.queryAsset(ctx, positionNumber);
        const position : Position = JSON.parse(positionResult);

        const electionResult = await this.queryAsset(ctx, position.electionNum);
        position.election = JSON.parse(electionResult);
                
        // try to compare with .getTime() - verification do not working
        if (await !this.isCandidacyTime(ctx, position.election)){
            throw new Error('The election is not on candidacy period.');
        }

        const candidate : Candidate = {
            docType: 'candidate',
            name: participant.name,
            proposal: proposal,
            participantNum: participantKey,
            positionNum: positionNumber,
            position: position,
        };

        const candidateNum : string = position.electionNum + '_CANDIDATE_' + participantKey;
        var candidateJson = JSON.stringify(candidate);
        await ctx.stub.putState(candidateNum, Buffer.from(candidateJson));
        return candidateJson + " criado. ";
    }

    //send mail to confirm access
    public async requestVote(ctx: Context, electionNum: string, key: string) {
        // a verificação sobre o eleitor acontece agora ou no momento do acesso? (register user)
        //hash for URL-safe base64-encoded 
        //verificar se periodo de votacao
        //verificar se ja votou nessa election/position

        // var sender = require('./send_email')
        
        var participantKey = ctx.clientIdentity.getAttributeValue('cpf');
        var participantResult = await this.queryAsset(ctx, participantKey);
        var participant : Participant = JSON.parse(participantResult);

        var electionResult = await this.queryAsset(ctx, electionNum);
        var election: Election = JSON.parse(electionResult);
        
        let idUint8Array = ctx.clientIdentity.getIDBytes();
        let crypto = new CryptoStuff();
        let hash = await crypto.sha256Hashing(idUint8Array.toString(), key);

        await this.checkToSubmitVote(ctx, hash)

        var securedHash = await crypto.aesGcmEncrypt(hash, key)

        new SendEmail(            
            participant.email,
            'Request to vote - ' + election.name,
            '<p>Link to grant access to the election poll - <a href="http://localhost:8080/api/getElectionForm/?token=' + securedHash +'&electionNum='+ electionNum +' "></a> </p>'
        ).sendMail();
    }    
    
    /* back from email, the front end page should be returned and then, on the click of the form,
    * this function could be called to finally put the state of the vote.
    */ 
   public async submitVote(ctx: Context, requestSecuredHash: string, candidateNumbers: string, key: string) {
        //#region Get Position from candidate
        let candidateNumArray = candidateNumbers.split(',');
        const candidateResult = await this.queryAsset(ctx, candidateNumArray[0]);
        const candidate : Candidate = JSON.parse(candidateResult);
        //double check if there is a candidate for each existed position
    
        const positionResult = await this.queryAsset(ctx, candidate.positionNum);
        const position : Position = JSON.parse(positionResult);
        //#endregion

        let idUint8Array = ctx.clientIdentity.getIDBytes();
        let crypto = new CryptoStuff();
        let hash = await crypto.sha256Hashing(idUint8Array.toString(), key);

        // one level ahead of encrypt, gonna undo this?
        let requestedHash = await crypto.aesGcmDecrypt(requestSecuredHash, key);

        if (requestedHash != hash){ // todo clean the error output
            throw new Error(`The voter is not the same one who requested to vote. - \n${hash} \n${requestedHash} \n${idUint8Array.toString()}`);
        }

        await this.checkToSubmitVote(ctx, hash)
        
        var voterHash = await crypto.aesGcmEncrypt(hash, key, Buffer.from('5BD465AEBA61'));        
        
        const vote : Vote = {
            docType: 'vote',
            candidateNumbers: candidateNumArray,
            electionNum: position.electionNum,
            voterHash
        };

        var encrypt = await crypto.aesGcmEncrypt(JSON.stringify(vote), key, Buffer.from('5BD465AEBA61'));

        const encryptedVote : EncryptedVote = {
            docType: 'encryptedVote',
            encryptedVoteHash: encrypt,
            electionNum: position.electionNum
        }

        var buffer = Buffer.from(JSON.stringify(encryptedVote));

        await ctx.stub.putState(hash, buffer);
        console.info('============= END : Create Vote ===========');
        return hash + " created";
    }

    public async verifyVote(ctx: Context, requestSecuredHash: string) {

    }
    
    public async submitVoteTallyResult(ctx: Context, electionNum: string, key: string){        
        const jsonEncryptedVoteList = await this.queryEncryptedVotesByElection(ctx, electionNum);
        
        const encryptedVoteMap = JSON.parse(jsonEncryptedVoteList);
        
        if (!encryptedVoteMap || !encryptedVoteMap.values){
            throw new Error(`There is no encrypted vote registered.`);
        }
        
        let voteList = await this.createVoteByEncryptedVote(ctx, encryptedVoteMap, key);
        
        if (voteList.length < 0){
            throw new Error(`There is no vote to be registered.`);
        }

        const votes : Votes = {
            docType: 'votes',
            votes: voteList,
            electionNum: voteList[0].electionNum
        }

        var hash: string = 'voteList_' + votes.electionNum;
        await ctx.stub.putState(hash, Buffer.from(JSON.stringify(votes)));
        return JSON.stringify(votes) + ' \nVoteList \n' + JSON.stringify(voteList) + '\n length '+ voteList.length;
    }

    private async createVoteByEncryptedVote(ctx:Context, encryptedVoteMap: any, key: string): Promise<Array<Vote>>{
        var voteList: Array<Vote> = new Array();
        let crypto = new CryptoStuff();

        await encryptedVoteMap.forEach(async value => {
            let encryptedVote =  value['Record'];
            let rawVote = await crypto.aesGcmDecrypt(encryptedVote.encryptedVoteHash, key);
            let vote = JSON.parse(rawVote);
            voteList.push(vote);            
        });

        return voteList;
    }
    // private startToSaveVoteOnLedger(ctx: Context, voteList: Array<Vote>){
    //     var qtd = 0;
    //     for (var i: number; i < voteList.length; i++ ){
    //         //this.saveVoteOnLedger(ctx, voteList[i]);
    //         ctx.stub.putState(voteList[i].voterHash, Buffer.from(JSON.stringify(voteList[i])));
    //         qtd = i;
    //     }
    //     return qtd;
    // }

    // private async saveVoteOnLedger(ctx: Context, vote: Vote){
    //     await ctx.stub.putState(vote.voterHash, Buffer.from(vote));
    //     return true;
    // }

    private async checkToSubmitVote(ctx: Context, hash: string) : Promise<Boolean>{
        const assetAsBytes = await ctx.stub.getState(hash); // check if there is any encryptedVote with same hash.
        if (assetAsBytes && assetAsBytes.length > 0) {
            throw new Error(`The voter assigned for the key ${hash} has already registered a vote for this election.`);
        }
        //Check voting period.
        return true;
    }

    private async checkToSubmitCandidacy(ctx: Context) : Promise<Boolean>{
        //Check if there is a candidacy under this election with the same participant
        // {
        //     "selector": {
        //        "docType": "candidate",
        //        "participantNum": "33312345678",
        //        "electionNum": "ELECTION0"
        //     }
        //  }

        //Check candidacy period.
        return false;
    }
    
    private async isCandidacyTime(ctx: Context, election: Election) :  Promise<Boolean>{
        if (election.candidacy_period_initial > new Date()){
            return false;
        }
        if (election.candidacy_period_final < new Date()){
            return false;
        }

        return true;
    }

    private async isVoteTime(ctx: Context, election: Election) :  Promise<Boolean>{
        if (election.voting_period_initial > new Date()){
            return false;
        }
        if (election.voting_period_final < new Date()){
            return false;
        }

        return true;
    }

    //Justo to development quick
    public async IdFromUserRequesting(ctx:Context){
        return "" + ctx.clientIdentity.getIDBytes()  + "";
    }

    private async getQueryResultForQueryString(ctx: Context, queryString: string): Promise<string> {
        //Promise<ChaincodeResponse>
        var resultsIterator = ctx.stub.getQueryResult(queryString);
        var buffer = this.assemblyJsonResponseFromIterator(resultsIterator);    
        return await buffer
    }

    private async assemblyJsonResponseFromIterator(resultsIterator: Promise<ShimApi.Iterators.StateQueryIterator> & AsyncIterable<ShimApi.Iterators.KV>) : Promise<string> {        
        var resultJson : string = "[";

        var memberAlreadyWritten = false
        var queryResponse = (await (await resultsIterator).next()).value
        do{
            if (queryResponse){
                // Add a comma before array members, suppress it for the first array member
                if (memberAlreadyWritten == true) {
                    resultJson+= ",";
                }
                resultJson+= "{\"Key\":";
                resultJson+= "\"";
                resultJson+= queryResponse.key;
                resultJson+= "\"";
        
                resultJson+= ", \"Record\":";
                // Record is a JSON object, so we write as-is
                resultJson+= String(queryResponse.value);
                resultJson+= "}";
                memberAlreadyWritten = true
                queryResponse = (await (await resultsIterator).next()).value
            }
        } while (queryResponse);
        resultJson += "]"
        return resultJson;
    }

}
