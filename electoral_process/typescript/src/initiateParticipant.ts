/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Gateway, Wallets } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';
import { CreateParticipant } from './createParticipant';
import { CreateUserParticipant } from './registerUserWithAttr';

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
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.ts application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('electoral_process');
                 
        await CreateParticipant.create(contract, '33312345678','Eduardo Kawai', 'edu@edu.edu');
        await CreateUserParticipant.create('33312345678','33312345678');
        // await contract.submitTransaction('createParticipant', '04212345678', 'Eduardo Kawai', 'edu@edu.edu');
        console.log(`PARTICIPANT0 has been created`);

        await CreateParticipant.create(contract, '40467289107','Adrian Kawai', 'Adrian@Adrian.edu');
        await CreateUserParticipant.create('40467289107','40467289107');
        // await contract.submitTransaction('createParticipant', '40467289107', 'Adrian Kawai', 'Adrian@Adrian.edu');
        console.log(`PARTICIPANT1 has been created`);

        await CreateParticipant.create(contract, '12589045678', 'Derick Kawai', 'Derick@Derick.edu')
        await CreateUserParticipant.create('12589045678','12589045678');
        // await contract.submitTransaction('createParticipant', '12589045678', 'Derick Kawai', 'Derick@Derick.edu');
        console.log(`PARTICIPANT2 has been created`);

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to InitiateParticipant: ${error}`);
        process.exit(1);
    }
}

main();