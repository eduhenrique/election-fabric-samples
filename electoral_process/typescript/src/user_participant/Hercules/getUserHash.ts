import { CryptoStuff } from "../../crypto";
import { RequestIdentity } from "../../requestIdentity";


async function main(){    
    console.log('started');
    let id = await new RequestIdentity().main('33312345678');    
    let hashedID = new CryptoStuff().sha256Hashing(id)    
    return hashedID;
}

main();