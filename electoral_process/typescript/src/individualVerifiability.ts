/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { RequestContract } from './requestContract';

export class IndividualVerifiability{
    constructor() { }

    async main(user: string, electionNum: string, requestSecuredHash: string, key: string){
        try {     
            console.log('IndividualVerifiability begin');
            let requestContract = new RequestContract()
            let [gateway, contract] = await requestContract.getContract(user);

            // Evaluate the specified transaction.
            const result = await contract.evaluateTransaction('electionIndividualVerifiability', electionNum, requestSecuredHash, key);            
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            
            gateway.disconnect();

        } catch (error) {
            console.error(`Failed to evaluate transaction - RequestIdentity: ${error}`);
            process.exit(1);
        }
    }
}
