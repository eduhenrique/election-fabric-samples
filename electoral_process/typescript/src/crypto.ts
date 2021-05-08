import { Wallets } from 'fabric-network';

export class CryptoStuff{    
    private cryptoImported = require('crypto');
    private walletPath = '';

    public constructor()
    {
      require('dotenv').config();
      this.walletPath = process.env.WALLET_PATH;      
    }

    public async aesGcmEncrypt(str : string)
    {
      let pw = await this.getEncryptionKey();
      console.log('\npw',pw);
      let key = this.cryptoImported.scryptSync(pw, 'blockchain', 32);
      console.log('\nkey',key);
      let iv = this.cryptoImported.randomBytes(12);
      console.log('before');
      const cipher = this.cryptoImported.createCipheriv('aes-256-gcm', key, iv);
      console.log('After');

      let enc = cipher.update(str, 'binary', 'hex');
      enc += cipher.final('hex');
      enc += iv.toString('hex');
      enc += cipher.getAuthTag().toString('hex');
  
      console.log('\n encrypt', enc);
      return enc;
    }

    public async aesGcmDecrypt(encrypted : any)
    {
      let fullString = encrypted;
      let tag = fullString.slice(fullString.length - 32, fullString.length);
      let nonce = fullString.slice(fullString.length - 32 - 24, fullString.length - 32);
      let encryptedData = fullString.substr(0, fullString.length - 32 - 24);
              
      let iv = Buffer.from(nonce,'hex');
      let authTag = Buffer.from(tag,'hex');
      let pw = await this.getEncryptionKey();
      let key = this.cryptoImported.scryptSync(pw, 'blockchain', 32);

      const decipher = this.cryptoImported.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);
      let str = decipher.update(encryptedData, 'hex', 'binary');
      str += decipher.final('binary');
      console.log('decrypt', str);
      return str;
    }   

    public async sha256Hashing(text : string)
    {
      let key = await this.getEncryptionKey();
      console.log('key', key)
      var plaintext = this.cryptoImported.createHmac("sha256", key)
      .update(text)
      var hash = this.hex(plaintext);
      return hash;
    }

    private async hex(text:any){
      const hash = text.digest("hex");
      console.log("  HMAC-HEX", hash + "\n");
      return hash;
    }

    private async getEncryptionKey(){
      const wallet = await Wallets.newFileSystemWallet(this.walletPath);
      //console.log('process.cwd()' , process.cwd());
      //console.log('wallet env path', this.walletPath);
      const adminIdentity = await wallet.get('admin');
      if (!adminIdentity) {
          console.log('An identity for the admin user "admin" does not exist in the wallet');
          console.log('Run the enrollAdmin.ts application before retrying');
          return;
      }
      const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
      const adminUser = await provider.getUserContext(adminIdentity, 'admin');      
      //console.log('Degub is on the table', adminUser.getSigningIdentity()['_signer']['_key']);
      //console.log('getSigningIdentity from adminuser', adminUser.getSigningIdentity()['_signer']['_key']['_key']['prvKeyHex']);
      var pk = adminUser.getSigningIdentity()['_signer']['_key']['_key']['prvKeyHex'];      
      return pk;
    }

    public async testing(){
      const voteTest = {
        "squadName": "Super hero squad",
        "homeTown": "Metro City",
        "formed": 2016,
        "secretBase": "Super tower",
        "active": true,
        "members": [
          {
            "name": "Molecule Man",
            "age": 29,
            "secretIdentity": "Dan Jukes",
            "powers": [
              "Radiation resistance",
              "Turning tiny",
              "Radiation blast"
            ]
          },
        ]
      };
      console.log('\n sha256');
      await this.sha256Hashing(JSON.stringify(voteTest));
      console.log('\n AES ENC');
      const aesEncrypt = await this.aesGcmEncrypt(JSON.stringify(voteTest));
      console.log('\n AES DEC');
      const decrypted = await this.aesGcmDecrypt(aesEncrypt);
    } 
}

//new CryptoStuff().testing();