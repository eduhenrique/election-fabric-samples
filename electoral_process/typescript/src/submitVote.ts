/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Gateway, Wallets } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', '..','test-network','organizations','peerOrganizations','org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('33312345678');
        if (!identity) {
            console.log('An identity for the user "33312345678" does not exist in the wallet');
            console.log('Run the registerUser.ts application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: '33312345678', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('electoral_process');

        //submitCandidato(ctx: Context, participanteNumber: string, cargoNumber: string)
        const result0 = await contract.submitTransaction('submitVote', 'ELECTION0_CANDIDATE_33312345678');
        console.log(`Vote registered for CANDIDATE_33312345678 - ` +`${result0.toString()}\n`);

        // const result1 = await contract.submitTransaction('submitVote', 'CANDIDATE0');
        // console.log(`Vote registered for CANDIDATE0 - ` +`${result1.toString()}\n`);

        // const result2 = await contract.submitTransaction('submitVote', 'CANDIDATE2');
        // console.log(`Vote registered for CANDIDATE2 - ` +`${result2.toString()}\n`);
        
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();