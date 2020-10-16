/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';
import { Eleicao } from './models/eleicao';
import { Cargo } from './models/cargo';
import { Participante } from './models/participante';
import { Shim, ChaincodeResponse } from 'fabric-shim';
import * as ShimApi from 'fabric-shim-api';
import { Candidato } from './models/candidato';
import { Voto } from './models/voto';
// import * as fastSha256 from "fast-sha256";
// import fastSha256, { Hash, HMAC } from "fast-sha256";
import { throws } from 'assert';
import { exception } from 'console';


export class ProcessoEleitoral extends Contract {

    public async initLedger(ctx: Context) {
        console.info('============= START : Initialize Ledger ===========');
        const eleicao : Eleicao =
        {
            docType: "eleicao",
            nome: "Diretoria 2020",
            inicio_candidatura: new Date("2020-10-15T06:00:00"),
            final_candidatura: new Date("2020-10-19T12:00:00"),
            inicio_votacao: new Date("2020-10-19T12:01:00"),
            final_votacao: new Date("2020-10-20T17:00:00"),
        };

        const cargos : Cargo[] = [
            {
                nome: "Diretor Geral",
                eleicaoNum: "ELEICAO0",
                // eleicao: eleicao,
            },
            {
                nome: "Coordenador",
                eleicaoNum: "ELEICAO0",
            }
        ];
        
        await ctx.stub.putState('ELEICAO0', Buffer.from(JSON.stringify(eleicao)));

        for (let i = 0; i < cargos.length; i++) {
            cargos[i].docType = 'cargo';
            await ctx.stub.putState('CARGO' + i, Buffer.from(JSON.stringify(cargos[i])));
            console.info('Added <--> ', cargos[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    public async createEleicao(ctx: Context, eleicaoNumber: string, nome: string, inicio_candidatura: Date, final_candidatura: Date, inicio_votacao: Date, final_votacao: Date ) {
        console.info('============= START : Create Eleicao ===========');        
        //verificar periodos (inicio candidatura tem que ser menor que fim candidatura...)
        //Como permitir que somente usuários admins utilizem essa função?
        
        if (!(inicio_candidatura.valueOf() < final_candidatura.valueOf() 
        && final_candidatura.valueOf() <= inicio_votacao.valueOf() 
        && inicio_votacao.valueOf() < final_votacao.valueOf())){            
            throw new Error('Periodos da eleição estão incoerentes. A candidatura deve ser antes da votação, e a data inicio deve ser antes da final.');            
        }

        const eleicao: Eleicao =
        {
            docType: "eleicao",
            nome,
            inicio_candidatura,
            final_candidatura,
            inicio_votacao,
            final_votacao,
        };

        await ctx.stub.putState(eleicaoNumber, Buffer.from(JSON.stringify(eleicao)));
        console.info('============= END : Create Eleicao ===========');
    }

    public async queryCargo(ctx: Context, cargoNumber: string): Promise<string> {
        const cargoAsBytes = await ctx.stub.getState(cargoNumber);
        if (!cargoAsBytes || cargoAsBytes.length === 0) {
            throw new Error(`${cargoNumber} does not exist`);
        }
        console.log(cargoAsBytes.toString());
                
        // return "\nClientIdentity.getIDBytes " + ctx.clientIdentity.getIDBytes()  + " " +
        // "\n" + cargoAsBytes.toString();
        return cargoAsBytes.toString();
    }

    public async queryAllCargosByEleicao(ctx: Context, eleicaoNum: string): Promise<string>{
        //Promise<ChaincodeResponse
        // var eleicaoNum:string = args[0].toLowerCase()
    
        var queryString = "{\"selector\":{\"docType\":\"cargo\",\"eleicaoNum\":\"" + eleicaoNum +"\"}}";
    
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

    public async queryEleicao(ctx: Context, eleicaoNumber: string): Promise<string> {
        const eleicaoAsBytes = await ctx.stub.getState(eleicaoNumber);
        if (!eleicaoAsBytes || eleicaoAsBytes.length === 0) {
            throw new Error(`${eleicaoNumber} does not exist`);
        }
        console.log(eleicaoAsBytes.toString());
        return eleicaoAsBytes.toString();
    }

    public async queryParticipante(ctx: Context, participanteNumber: string): Promise<string> {
        const participanteAsBytes = await ctx.stub.getState(participanteNumber);
        if (!participanteAsBytes || participanteAsBytes.length === 0) {
            throw new Error(`${participanteNumber} does not exist`);
        }
        console.log(participanteAsBytes.toString());
        return participanteAsBytes.toString();
    }

    public async queryCandidato(ctx: Context, candidatoNumber: string): Promise<string> {
        const candidatoAsBytes = await ctx.stub.getState(candidatoNumber);
        if (!candidatoAsBytes || candidatoAsBytes.length === 0) {
            throw new Error(`${candidatoNumber} does not exist`);
        }
        console.log(candidatoAsBytes.toString());
        return candidatoAsBytes.toString();
    }

    public async createCargo(ctx: Context, cargoNumber: string, nome: string, eleicaoNumber: string) {
        console.info('============= START : Create Cargo ===========');
        //verificar se é update ou create - fazer um getAll por Eleicao
        const eleicaoResult = await this.queryEleicao(ctx, eleicaoNumber);
        const eleicao: Eleicao = JSON.parse(eleicaoResult);
        console.log(eleicaoResult);

        const cargo: Cargo = {
            nome,
            docType: 'cargo',
            eleicaoNum: eleicaoNumber
        };

        await ctx.stub.putState(cargoNumber, Buffer.from(JSON.stringify(cargo)));
        console.info('============= END : Create Cargo ===========');
    }

    public async createParticipante(ctx: Context, cpf: string, nome: string, email: string) {
        console.info('============= START : Create Participante ===========');

        const participante: Participante = {
            nome,
            docType: 'participante',
            cpf,
            email,
        };

        //await ctx.stub.putState(participanteNumber, Buffer.from(JSON.stringify(participante)));
        await ctx.stub.putState(cpf, Buffer.from(JSON.stringify(participante)));
        console.info('============= END : Create Participante ===========');
    }

    public async submitCandidato(ctx: Context, cargoNumber: string, proposta: string) {
        //verificar se periodo de candidatura.
        //verificar se já se candidatou para algum cargo nessa eleicao.
        //O link para confirmar candidatura chegará no email registrado?
        //O código do chainchode permanece fechado?

            //utilizar tag attr_reqs no momento de registrar o user - (registrar o user logo após criar o participante?
            // utilizar o cpf como key?)

        var participanteKey = ctx.clientIdentity.getAttributeValue('cpf');
        const participanteResult = await this.queryParticipante(ctx, participanteKey);
        const participante : Participante = JSON.parse(participanteResult);

        const cargoResult = await this.queryCargo(ctx, cargoNumber);
        const cargo : Cargo = JSON.parse(cargoResult);

        const eleicaoResult = await this.queryEleicao(ctx, cargo.eleicaoNum);
        cargo.eleicao = JSON.parse(eleicaoResult);

        if (cargo.eleicao.inicio_candidatura.valueOf() > new Date().valueOf()){
            throw new Error('Periodo de candidatura não começou.');
        }
        if (cargo.eleicao.final_candidatura.valueOf() < new Date().valueOf()){
            throw new Error(`Periodo de candidatura já terminou.`);            
        }

        const candidato : Candidato = {
            docType: 'candidato',
            nome: participante.nome,
            proposta: proposta,
            participanteNum: participanteKey,
            cargoNum: cargoNumber,
            cargo: cargo,
        };

        const candidatoNum : string = 'CANDIDATO_' + participanteKey;
        var candidatoJson = JSON.stringify(candidato);
        await ctx.stub.putState(candidatoNum, Buffer.from(candidatoJson));
        return candidatoJson + " criado. ";
    }

    public async requestVoto(ctx: Context, participanteNumber: string, cpf: string, email: string) {
        // a verificação sobre o eleitor acontece agora ou no momento do acesso? (register user)
        //hash for URL-safe base64-encoded 
        //verificar se periodo de votacao
        //verificar se ja votou nessa eleicao/cargo 
    }
    
    public async submitVoto(ctx: Context, participanteNumber: string, cpf: string, candidatoNumber:string) {
        //(o voto de uma eleicao só é registrado se todos os cargos forem selecionados/votados?)
        var fastSha256 = require("fast-sha256");
        let idUint8Array = ctx.clientIdentity.getIDBytes();
        let hash = "";
        
        //#region String To UInt8Array
        let eleicaoKey = "ELEICAO"; // pegar dinamicamente query: candidato -> cargo -> eleicao
        let buffer = new ArrayBuffer(eleicaoKey.length);
        let salt = new Uint8Array(buffer);
        for (let i = 0; i < eleicaoKey.length; i++) {
            salt[i] = eleicaoKey.charCodeAt(i);
        }
        //#endregion
        try{
            //let aaa = new HMAC(salt).digest();
            let hashBytes = fastSha256.hkdf(idUint8Array, salt); //Salt seria a key da eleicao em questão?            
            hash = hashBytes.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        catch(err){
            throw new Error(err.message);
        }
        const voto : Voto = {
            docType: 'voto',
            eleitorHash: hash,
            candidatoNum: candidatoNumber
        };
        const votoNum : string = 'VOTO' + participanteNumber.replace('PARTICIPANTE','');
        await ctx.stub.putState(votoNum, Buffer.from(JSON.stringify(voto)));
        return votoNum + " criado. Identificador do usuário é: " + hash;
    }

    private async isPeriodoCandidatura(ctx: Context, eleicao: Eleicao){
        // if (eleicao.inicio_candidatura < new Date())
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
