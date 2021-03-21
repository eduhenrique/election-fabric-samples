/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';
import { Election } from './models/election';
import { Position } from './models/position';
import { Participant } from './models/participant';
import { Shim, ChaincodeResponse } from 'fabric-shim';
import * as ShimApi from 'fabric-shim-api';
import { Candidate } from './models/candidate';
import { Vote } from './models/vote';
// import * as fastSha256 from "fast-sha256";
// import fastSha256, { Hash, HMAC } from "fast-sha256";
import { SendEmail } from './send_email';
import { throws } from 'assert';
import { exception } from 'console';


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
            voting_period_final: new Date("2020-10-20T17:00:00"),
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

    public async createElection(ctx: Context, electionNumber: string, name: string, candidacy_period_initial: Date, candidacy_period_final: Date, voting_period_initial: Date, voting_period_final: Date ) {
        console.info('============= START : Create Election ===========');        
        //verificar periodos (inicio candidatura tem que ser menor que fim candidatura...)
        //Como permitir que somente usuários admins utilizem essa função?
        
        if (!(candidacy_period_initial.valueOf() < candidacy_period_final.valueOf() 
        && candidacy_period_final.valueOf() <= voting_period_initial.valueOf() 
        && voting_period_initial.valueOf() < voting_period_final.valueOf())){            
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
        //Promise<ChaincodeResponse
        // var electionNum:string = args[0].toLowerCase()
    
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
    public async requestCandidacy(ctx: Context, electionNum: string) {
        //verificar se já é um candidato.
        var participantKey = ctx.clientIdentity.getAttributeValue('cpf');
        const participantResult = await this.queryAsset(ctx, participantKey);
        const participant : Participant = JSON.parse(participantResult);

        var electionResult = await this.queryAsset(ctx, electionNum);
        var election: Election = JSON.parse(electionResult);
        //user CPF + token by link ( confirmation email with a button)
        
        let hash = this.createToken(ctx, electionNum, "vote");

        const assetAsBytes = await ctx.stub.getState(hash);        
        if (assetAsBytes && assetAsBytes.length > 0) {
            throw new Error(`The voter assigned for the key ${hash} has already registered a vote for this election.`);
        }

        new SendEmail(            
            participant.email,
            'Request to candidacy - ' + election.name,
            '<p>Link to grant access to the candidate area - <a href="http://localhost:8080/api/candidacy/?token=' + hash + '&cpf='+ participantKey +'&electionNum='+ electionNum+' "></a> </p>'
        ).sendMail();
    }

    /* back from email, the front end page should be returned and then, on the click of the front end page
    * this function could be called to finally put the state of the candidacy.
    */ 
    public async submitCandidate(ctx: Context, positionNumber: string, proposal: string) {
        //verificar se periodo de candidatura.
        //verificar se já se candidateu para algum position nessa election.
        //O link para confirmar candidatura chegará no email registrado?
        //O código do chainchode permanece fechado?

        var participantKey = ctx.clientIdentity.getAttributeValue('cpf');
        const participantResult = await this.queryAsset(ctx, participantKey);
        const participant : Participant = JSON.parse(participantResult);

        const positionResult = await this.queryAsset(ctx, positionNumber);
        const position : Position = JSON.parse(positionResult);

        const electionResult = await this.queryAsset(ctx, position.electionNum);
        position.election = JSON.parse(electionResult);
                
        // try to compare with .getTime() - verification do not working
        if (position.election.candidacy_period_initial.valueOf() > new Date().valueOf()){
            throw new Error('The candidacy period has not initiate.');
        }
        if (position.election.candidacy_period_final.valueOf() < new Date().valueOf()){
            throw new Error(`The candidacy period has already finished.`);            
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
    public async requestVote(ctx: Context, electionNum: string) {
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
        //user CPF + token by link ( confirmation email with a button)
        
        let hash = this.createToken(ctx, electionNum, "vote");

        const assetAsBytes = await ctx.stub.getState(hash);        
        if (assetAsBytes && assetAsBytes.length > 0) {
            throw new Error(`The voter assigned for the key ${hash} has already registered a vote for this election.`);
        }

        new SendEmail(            
            participant.email,
            'Request to vote - ' + election.name,
            '<p>Link to grant access to the election poll - <a href="http://localhost:8080/api/getElectionForm/?token=' + hash + '&cpf='+ participantKey +'&electionNum='+ electionNum+' "></a> </p>'
        ).sendMail();
    }    
    
    /* back from email, the front end page should be returned and then, on the click of the form,
    * this function could be called to finally put the state of the vote.
    */ 
   public async submitVote(ctx: Context, candidateNumber:string) {
        //#region Get Position from candidate 
        const candidateResult = await this.queryAsset(ctx, candidateNumber);
        const candidate : Candidate = JSON.parse(candidateResult);
        
        const positionResult = await this.queryAsset(ctx, candidate.positionNum);
        const position : Position = JSON.parse(positionResult);
        //#endregion
        let hash = this.createToken(ctx, position.electionNum, "vote");

        const assetAsBytes = await ctx.stub.getState(hash);        
        if (assetAsBytes && assetAsBytes.length > 0) {
            throw new Error(`The voter assigned for the key ${hash} has already registered a vote for this election.`);
        }
        
        const vote : Vote = {
            docType: 'vote',
            voterHash: hash,
            candidateNum: candidateNumber
        };
        const voteNum : string = hash;
        await ctx.stub.putState(voteNum, Buffer.from(JSON.stringify(vote)));
        return voteNum + " criado. Identificador do usuário é: " + hash;
    }

    private createToken(ctx: Context, electionNum: string, action: string) {
        var fastSha256 = require("fast-sha256");
        let idUint8Array = ctx.clientIdentity.getIDBytes();
        let hash = "";

        //#region String To UInt8Array
        let electionKey = electionNum + "-" + action;
        let buffer = new ArrayBuffer(electionKey.length);
        let salt = new Uint8Array(buffer);
        for (let i = 0; i < electionKey.length; i++) {
            salt[i] = electionKey.charCodeAt(i);
        }
        //#endregion
        try {
            //let aaa = new HMAC(salt).digest();
            let hashBytes = fastSha256.hkdf(idUint8Array, salt); //Salt seria a key da election em questão?            
            hash = hashBytes.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        catch (err) {
            throw new Error(err.message);
        }
        return hash;
    }
    
    private async isPeriodoCandidatura(ctx: Context, election: Election){
        // if (election.candidacy_period_initial < new Date())
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
