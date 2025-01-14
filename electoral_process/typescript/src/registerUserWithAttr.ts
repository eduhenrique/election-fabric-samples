/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Wallets, X509Identity } from 'fabric-network';
import * as FabricCAServices from 'fabric-ca-client';
import * as path from 'path';
import * as fs from 'fs';

export class CreateUserParticipant{
    constructor() { }

    static async create(cpf: string, name: string) {
        try {
            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', '..', '..','test-network','organizations','peerOrganizations','org1.example.com', 'connection-org1.json');
            let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
                
            // Create a new CA client for interacting with the CA.
            const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
            const ca = new FabricCAServices(caURL);
    
            // Create a new file system based wallet for managing identities.            
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
            
            // Check to see if we've already enrolled the user.
            const userIdentity = await wallet.get(name);
            if (userIdentity) {
                console.log("An identity for the user " + name + " already exists in the wallet");
                return;
            }
    
            // Check to see if we've already enrolled the admin user.
            const adminIdentity = await wallet.get('admin');
            if (!adminIdentity) {
                console.log('An identity for the admin user "admin" does not exist in the wallet');
                console.log('Run the enrollAdmin.ts application before retrying');
                return;
            }
    
            // build a user object for authenticating with the CA
           const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);       
           const adminUser = await provider.getUserContext(adminIdentity, 'admin');
    
            // Register the user, enroll the user, and import the new identity into the wallet.
            const secret = await ca.register({ enrollmentID: name, affiliation: 'org1.department1', role: 'client', attrs: [{ name: 'cpf', value: cpf, ecert: true }, { name: 'electionRole', value: 'participant', ecert: true }] }, adminUser);
            console.log(`Secret :  ${secret}\n`)
            const enrollment = await ca.enroll({ enrollmentID: name, enrollmentSecret: secret, attr_reqs: [{ name: 'cpf', optional: false }, { name: 'electionRole', optional: false }] });

            const x509Identity: X509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'Org1MSP',
                type: 'X.509',
            };
            await wallet.put(name, x509Identity);
            console.log("Successfully registered and enrolled participant user " + name + " and imported it into the wallet.");
    
        } catch (error) {
            console.error(`Failed to register user ${name}: ${error}`);
            process.exit(1);
        }
    }
}
