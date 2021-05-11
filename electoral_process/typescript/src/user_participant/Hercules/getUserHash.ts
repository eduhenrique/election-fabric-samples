import { CryptoStuff } from "../../crypto";
import { AccessPrivateKey } from "../../getPrivateKey";
import { RequestIdentity } from "../../requestIdentity";


async function main(){    
    console.log('started');
    let id = await new RequestIdentity().main('33312345678');    
    let key = await new AccessPrivateKey().getPrivateKey();
    console.log('\nKey', key);
    let hashedID = await new CryptoStuff().sha256Hashing(id, key);
    console.log('\nhashedID', hashedID);
    return hashedID;
}

main();