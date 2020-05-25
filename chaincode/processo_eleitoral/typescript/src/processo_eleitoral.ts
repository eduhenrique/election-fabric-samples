/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';
import { Eleicao } from './models/eleicao';
import { Cargo } from './models/cargo';
import { Participante } from './models/participante';

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
                eleicao: eleicao,
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
        return cargoAsBytes.toString();
    }

    public async queryEleicao(ctx: Context, eleicaoNumber: string): Promise<string> {
        const eleicaoAsBytes = await ctx.stub.getState(eleicaoNumber);
        if (!eleicaoAsBytes || eleicaoAsBytes.length === 0) {
            throw new Error(`${eleicaoNumber} does not exist`);
        }
        console.log(eleicaoAsBytes.toString());
        return eleicaoAsBytes.toString();
    }

    public async createCargo(ctx: Context, cargoNumber: string, nome: string, eleicaoNumber: string) {
        console.info('============= START : Create Cargo ===========');
        
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
}
