import { JSONSerializer } from 'fabric-contract-api';
import { Position } from './models/position';

export class CryptoStuff{
    private sender : any;
    private mailMounted : any;
    private nodemailer = require("nodemailer");
    private cryptoImported = require('crypto');

    constructor()
    {
        require('dotenv').config();
        //this.sha256Hashing();

        const aesCipher = this.aes256gcm(process.env.TOKEN_KEY);
        
        const voteTest = {VOTE : 'a1', candidate : '-c3_', SurpriseD : ' '};
        const [encrypted, iv, authTag] = aesCipher.encrypt(JSON.stringify(voteTest));
        const decrypted = aesCipher.decrypt(encrypted);
        console.log(decrypted);
    }

        // Demo implementation of using `aes-256-gcm` with node.js's `crypto` lib.
    aes256gcm(key:string){
        const ALGO = 'aes-256-gcm';
        
        // encrypt returns base64-encoded ciphertext
        const encrypt = (str) => {
            // Hint: the `iv` should be unique (but not necessarily random).
            // `randomBytes` here are (relatively) slow but convenient for          

            const iv = this.cryptoImported.randomBytes(12);

            console.log('r-iv', iv);
            const cipher = this.cryptoImported.createCipheriv(ALGO, key, iv);
                    
            // Hint: Larger inputs (it's GCM, after all!) should use the stream API
            let enc = cipher.update(str, 'binary', 'hex');
            enc += cipher.final('hex');
            
            enc += iv.toString('hex');
            
            enc += cipher.getAuthTag().toString('hex');            
     
            console.log('encrypt', [enc, iv, cipher.getAuthTag()]);
            return [enc, iv.toString('hex'), cipher.getAuthTag().toString('hex')];
        };
    
        // decrypt decodes base64-encoded ciphertext into a utf8-encoded string
        const decrypt = (enc) => {
            console.log('\n',enc);

            let fullString = enc;
            let tag = fullString.slice(fullString.length - 32, fullString.length);
            let nonce = fullString.slice(fullString.length - 32 - 24, fullString.length - 32);
            let encryptedData = fullString.substr(0, fullString.length - 32 - 24);
            
            // if (ivString == iv)
                console.log("ivString", nonce);
            // if (tagString == authTag)
                console.log("tagString", tag);
            
            console.log("encString", encryptedData);

            let iv = Buffer.from(nonce,'hex');
            let authTag = Buffer.from(tag,'hex');
            console.log(iv);
            console.log(authTag);

            const decipher = this.cryptoImported.createDecipheriv(ALGO, key, iv);
            console.log("Decipher ")
            decipher.setAuthTag(authTag);
            console.log("setAuthTag ")
            let str = decipher.update(encryptedData, 'hex', 'binary');
            console.log("Dec.Update ")
            str += decipher.final('binary');            
            console.log('decrypt', str);
            return str;
        };
        return {
        encrypt,
        decrypt,
        };
    };

    sha256Hashing()
    {
        const plaintext = this.cryptoImported.createHmac("sha256", process.env.TOKEN_KEY)
        .update("Man oh man do I love node!")
        
        this.hex(plaintext);


        const voteTest = {VOTE : 'aaaa', candidate : 'HUmmmmm'};
        const plaintext2 = this.cryptoImported.createHmac("sha256", process.env.TOKEN_KEY)
        .update(JSON.stringify(JSON.stringify(voteTest)))

        this.hex(plaintext2);
    }

    hex(text:any){
        const hash = text.digest("hex");
        console.log("  HMAC-HEX", hash);        
    }    
}

  new CryptoStuff();