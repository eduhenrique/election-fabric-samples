/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { RequestContract } from './requestContract';

export class RequestIdentity{
    constructor() { }

    public async main(user: string) : Promise<string>{
        try {     
            console.log('RequestIdentity begin');
            let requestContract = new RequestContract()
            let [gateway, contract] = await requestContract.getContract(user);

            // Evaluate the specified transaction.
            const result = await contract.evaluateTransaction('IdFromUserRequesting');            
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            
            gateway.disconnect();

            return result.toString();
        } catch (error) {
            console.error(`Failed to evaluate transaction - RequestIdentity: ${error}`);
            process.exit(1);
        }
    }
}
