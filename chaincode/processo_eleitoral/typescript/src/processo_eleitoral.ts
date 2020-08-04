/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';
import { Eleicao } from './models/eleicao';
import { Cargo } from './models/cargo';
import { Participante } from './models/participante';
import { Shim } from 'fabric-shim';
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
            inicio_candidatura: "2020-10-15T09:00",
            final_candidatura: "2020-10-19T12:00",
            inicio_votacao: "2020-10-19T13:00",
            final_votacao: "2020-10-20T17:00",
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

    public async queryCargo(ctx: Context, cargoNumber: string): Promise<string> {
        const cargoAsBytes = await ctx.stub.getState(cargoNumber);
        if (!cargoAsBytes || cargoAsBytes.length === 0) {
            throw new Error(`${cargoNumber} does not exist`);
        }
        console.log(cargoAsBytes.toString());
                
        return "\nClientIdentity.getIDBytes " + ctx.clientIdentity.getIDBytes()  + " " +
        "\n" + cargoAsBytes.toString();
    }

    //Needed to be a custom query through Rich couchDB query?
    // public async queryAllCargosByEleicao(ctx: Context, eleicaoNumber: string): Promise<string> {
    //     const startKey = 'CARGO0';
    //     const endKey = 'CARGO999';
    //     const allResults = [];
    //     for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
    //         const strValue = Buffer.from(value).toString('utf8');
    //         let record;
    //         try {
    //             record = JSON.parse(strValue);
    //         } catch (err) {
    //             console.log(err);
    //             record = strValue;
    //         }
    //         allResults.push({ Key: key, Record: record });
    //     }

    //     console.info(allResults);
    //     return JSON.stringify(allResults);
    // }

    // peer chaincode query -C mychannel -n processo_eleitoral -c '{"Args":["queryCargosByEleicao","ELEICAO0"]}'

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

    public async createParticipante(ctx: Context, participanteNumber: string, nome: string, cpf: string, email: string) {
        console.info('============= START : Create Cargo ===========');

        const participante: Participante = {
            nome,
            docType: 'participante',
            cpf,
            email,
        };

        await ctx.stub.putState(participanteNumber, Buffer.from(JSON.stringify(participante)));
        console.info('============= END : Create Participante ===========');
    }

    public async submitCandidato(ctx: Context, participanteNumber: string, cargoNumber: string) {
        //verificar se periodo de candidatura.
        //verificar se já se candidatou para algum cargo nessa eleicao.
        //O link para confirmar candidatura chegará no email registrado?
        //O código do chainchode permanece fechado?

        const participanteResult = await this.queryEleicao(ctx, participanteNumber);
        const participante : Participante = JSON.parse(participanteResult);

        const candidato : Candidato = {
            docType: 'candidato',            
            nome: participante.nome,
            participanteNum: participanteNumber,            
            cargoNum: cargoNumber,
        };

        const candidatoNum : string = 'CANDIDATO' + participanteNumber.replace('PARTICIPANTE','');
        await ctx.stub.putState(candidatoNum, Buffer.from(JSON.stringify(candidato)));
        return candidatoNum + " criado."  ;
    }

    public async requestVoto(ctx: Context, participanteNumber: string, cpf: string, email: string) {
        //hash for URL-safe base64-encoded 
        //verificar se periodo de votacao
        //verificar se ja votou nessa eleicao/cargo 
    }
    
    public async submitVoto(ctx: Context, participanteNumber: string, cpf: string, candidatoNumber:string) {
        //(o voto de uma eleicao só é registrado se todos os cargos forem selecionados/votados?)
        var fastSha256 = require("fast-sha256");
        let idUint8Array = ctx.clientIdentity.getIDBytes();
        let hash = "";
        let wayBack = ""; // teste

        //#region String To UInt8Array
        let eleicaoKey = "ELEICAO0";
        let buffer = new ArrayBuffer(eleicaoKey.length);
        let salt = new Uint8Array(buffer);
        for (let i = 0; i < eleicaoKey.length; i++) {
            salt[i] = eleicaoKey.charCodeAt(i);
        }
        //#endregion
        try{
            //let aaa = new HMAC(salt).digest();
            let hashBytes = fastSha256.hkdf(idUint8Array, salt); //Salt seria a key da eleicao em questão?
            wayBack = String.fromCharCode.apply(null, Array.from(hashBytes));
            hash = hashBytes.toString();
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
        //await ctx.stub.putState(votoNum, Buffer.from(JSON.stringify(voto)));
        return votoNum + " criado. Identificador do usuário é: " + hash + " hashBytes Wayback - " + wayBack;
    }

}
