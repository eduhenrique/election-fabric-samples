/*
 * SPDX-License-Identifier: Apache-2.0
 */
export class CreateParticipante{
    constructor() { }

    static async create(contract: any, cpf: string, nome: string, email: string) {
        try {
    
            console.log("Começo CreateParticipante");
            await contract.submitTransaction('createParticipante', cpf, nome, email);
            console.log(`PARTICIPANTE ${nome} has been created`);
    
        } catch (error) {
            console.error(`Failed to submit transaction - CreateParticipante: ${error}`);
            process.exit(1);
        }
    }
}