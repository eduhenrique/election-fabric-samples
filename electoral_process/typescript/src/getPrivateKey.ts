import { Wallets } from 'fabric-network';
import { CryptoStuff } from "./crypto";

export class AccessPrivateKey{
    private walletPath = '';

    public constructor() 
    {
      require('dotenv').config();
      this.walletPath = process.env.WALLET_PATH;
    }
    
    async getPrivateKey(){
        const wallet = await Wallets.newFileSystemWallet(this.walletPath);
        //console.log('process.cwd()' , process.cwd());
        //console.log('wallet env path', this.walletPath);
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.ts application before retrying');
            return;
        }
        const provider = await wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');      
        //console.log('Degub is on the table', adminUser.getSigningIdentity()['_signer']['_key']);
        //console.log('getSigningIdentity from adminuser', adminUser.getSigningIdentity()['_signer']['_key']['_key']['prvKeyHex']);
        var pk = adminUser.getSigningIdentity()['_signer']['_key']['_key']['prvKeyHex'];      
        
        console.log('\nprivateKey', pk);
        return pk;
      }

}