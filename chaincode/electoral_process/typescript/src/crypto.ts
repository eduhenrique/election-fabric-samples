
export class CryptoStuff{    
    private cryptoImported = require('crypto');

    public constructor()
    {
        require('dotenv').config();
    }

    public async aesGcmEncrypt(str : string)
    {
        const key = process.env.TOKEN_KEY;
        const iv = this.cryptoImported.randomBytes(12);        
        const cipher = this.cryptoImported.createCipheriv('aes-256-gcm', key, iv);

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
        const key = process.env.TOKEN_KEY;

        const decipher = this.cryptoImported.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);
        let str = decipher.update(encryptedData, 'hex', 'binary');
        str += decipher.final('binary');
        console.log('decrypt', str);
        return str;
    }   

    public async sha256Hashing(text : string)
    {
        var plaintext = this.cryptoImported.createHmac("sha256", process.env.TOKEN_KEY)
        .update(text)
        var hash = this.hex(plaintext);
        return hash;
    }

    private async hex(text:any){
        const hash = text.digest("hex");
        console.log("  HMAC-HEX", hash);
        return hash;
    }

    public testing(){
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
      this.sha256Hashing(JSON.stringify(voteTest));
      const aesEncrypt = this.aesGcmEncrypt(JSON.stringify(voteTest));
      const decrypted = this.aesGcmDecrypt(aesEncrypt);
    } 
}

//new CryptoStuff().testing();