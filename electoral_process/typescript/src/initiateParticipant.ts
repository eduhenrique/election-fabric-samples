import { Contract } from 'fabric-network';
/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateUserParticipant } from './registerUserWithAttr';
import { RequestContract } from './requestContract';

export class Participant{ cpf: string; dname: string; email: string }

export class InitiateParticipant{
    constructor() { }
    
    async initiateParticipant(user: string, participant: Participant) {
        try {
            let requestContract = new RequestContract()
            let [gateway, contract] = await requestContract.getContract(user);

            await CreateParticipant.create(contract, participant.cpf, participant.dname, participant.email);
            await CreateUserParticipant.create(participant.cpf, participant.cpf);
            
            gateway.disconnect();
            
        } catch (error) {
            console.error(`Failed to InitiateParticipant: ${error}`);
            process.exit(1);
        }
    }   
}


export class CreateParticipant{
    constructor() { }

    static async create(contract: any, cpf: string, dname: string, email: string) {
        try {
            console.log("_");
            console.log("Begin CreateParticipant");
            console.log('createParticipant', cpf, dname, email);
            await contract.submitTransaction('createParticipant', cpf, dname, email);
            console.log(`PARTICIPANT ${dname} has been created`);
    
        } catch (error) {
            console.error(`Failed to submit transaction - CreateParticipante: ${error}`);
            process.exit(1);
        }
    }
}