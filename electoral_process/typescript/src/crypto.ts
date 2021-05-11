
export class CryptoStuff{    
    private cryptoImported = require('crypto');

    public constructor()
    {
      require('dotenv').config();
    }

    public async aesGcmEncrypt(str : string, key: string)
    {
      let iv = this.cryptoImported.randomBytes(12);
      const cipher = this.cryptoImported.createCipheriv('aes-256-gcm', key, iv);

      let enc = cipher.update(str, 'binary', 'hex');
      enc += cipher.final('hex');
      enc += iv.toString('hex');
      enc += cipher.getAuthTag().toString('hex');
  
      console.log('\n encrypt', enc);
      return enc;
    }

    public async aesGcmDecrypt(encrypted : any, key: string)
    {
      let fullString = encrypted;
      let tag = fullString.slice(fullString.length - 32, fullString.length);
      let nonce = fullString.slice(fullString.length - 32 - 24, fullString.length - 32);
      let encryptedData = fullString.substr(0, fullString.length - 32 - 24);
              
      let iv = Buffer.from(nonce,'hex');
      let authTag = Buffer.from(tag,'hex');

      const decipher = this.cryptoImported.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);
      let str = decipher.update(encryptedData, 'hex', 'binary');
      str += decipher.final('binary');
      console.log('decrypt', str);
      return str;
    }
    
    public async createAESKeybyPassword(password : string) : Promise<string>{
      let key = this.cryptoImported.scryptSync(password, 'blockchain', 32);
      return key;
    }

    public async sha256Hashing(text : string, key: string)
    {      
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

      let keyTest = await this.createAESKeybyPassword('hmmmmTeste');
      console.log('\n sha256');
      await this.sha256Hashing(JSON.stringify(voteTest), keyTest);
      console.log('\n AES ENC');
      const aesEncrypt = await this.aesGcmEncrypt(JSON.stringify(voteTest), keyTest);
      console.log('\n AES DEC');
      const decrypted = await this.aesGcmDecrypt(aesEncrypt, keyTest);
    } 
}

//new CryptoStuff().testing();