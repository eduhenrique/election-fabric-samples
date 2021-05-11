import { Contract } from 'fabric-network';
/*
 * SPDX-License-Identifier: Apache-2.0
 */
 
import { RequestContract } from './requestContract';

export class SubmitVote{
    constructor() { }
    
    async main(user: string, voterHash: string, candidateNumbers: string[], key: string) {
        try {
            let requestContract = new RequestContract()
            let [gateway, contract] = await requestContract.getContract(user);
            let concatenatedString = '';
            candidateNumbers.map(key => {
                concatenatedString += key + ', '
            });
            concatenatedString = concatenatedString.substr(0,concatenatedString.length-2)
                        
            const result0 = await contract.submitTransaction('submitVote', voterHash, concatenatedString, key);
            console.log(`Vote registered for ${candidateNumbers} - ${result0.toString()}\n`);

            // Disconnect from the gateway.
            gateway.disconnect();
            
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            process.exit(1);
        }
    }
}