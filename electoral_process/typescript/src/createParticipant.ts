/*
 * SPDX-License-Identifier: Apache-2.0
 */
export class CreateParticipant{
    constructor() { }

    static async create(contract: any, cpf: string, dname: string, email: string) {
        try {
            console.log("_");
            console.log("Begin CreateParticipant");
            await contract.submitTransaction('createParticipant', cpf, dname, email);
            console.log(`PARTICIPANT ${dname} has been created`);
    
        } catch (error) {
            console.error(`Failed to submit transaction - CreateParticipante: ${error}`);
            process.exit(1);
        }
    }
}