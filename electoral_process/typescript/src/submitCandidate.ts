/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { RequestContract } from './requestContract';

export class SubmitCandidate{
    constructor() { }

    async main(user: string, position: string, proposal: string, voterHash: string, key: string) {
        try {
            let requestContract = new RequestContract()
            let [gateway, contract] = await requestContract.getContract(user);
            
            const result0 = await contract.submitTransaction('submitCandidate', position, proposal, voterHash, key);
            console.log(`Candidate on ${proposal} has been submitted - ${result0.toString()}\n`);

            gateway.disconnect();
        
        } catch (error) {
            console.error(`Failed to submit transaction - Candidate: ${error}`);
            process.exit(1);
        }
    }
}