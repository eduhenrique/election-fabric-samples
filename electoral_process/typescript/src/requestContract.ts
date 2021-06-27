import { error } from 'console';
/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Gateway, Wallets } from 'fabric-network';
import * as fs from 'fs';


export class RequestContract{
    public constructor() { require('dotenv').config(); }

    public async getContract(user: string) {
        try {
            // load the network configuration
            const ccpPath = process.env.CONFIGURATION_PATH;
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            // Create a new file system based wallet for managing identities.
            const walletPath = process.env.WALLET_PATH;
            const wallet = await Wallets.newFileSystemWallet(walletPath);            

            // Check to see if we've already enrolled the user.
            const identity = await wallet.get(user);
            if (!identity) {
                console.log('An identity for the user '+user+' does not exist in the wallet');
                console.log('Run the registerUser.ts application before retrying');
                throw new error('401 - An identity for the user '+user+' does not exist in the wallet');
            }

            // Create a new gateway for connecting to our peer node.
            let gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });

            // Get the network (channel) our contract is deployed to.
            let network = await gateway.getNetwork('mychannel');

            // Get the contract from the network.
            let contract = network.getContract('electoral_process');
            
            return [gateway, contract];
        } catch (error) {
            console.error(`Failed to retrieve contract: ${error}`);
            throw error;
        }
    }
}
