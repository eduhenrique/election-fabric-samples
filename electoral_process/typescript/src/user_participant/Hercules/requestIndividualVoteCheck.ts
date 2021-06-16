import { CryptoStuff } from "../../crypto";
import { AccessPrivateKey } from "../../getPrivateKey";
import { RequestIdentity } from "../../requestIdentity";
import { IndividualVerifiability } from "../../individualVerifiability";

async function main(){
    
    let id = await new RequestIdentity().main('33312345678');    
    let key = await new AccessPrivateKey().getPrivateKey();
    let crypto = new CryptoStuff();
    let voterHash = await crypto.sha256Hashing(id, key);
    let securedHash = await crypto.aesGcmEncrypt(voterHash, key);

    console.log('\nsecuredHash:  '+securedHash);
    
    let submitVote = new IndividualVerifiability();
    let electionNum = 'ELECTION0'

    submitVote.main('33312345678', electionNum, securedHash, key);
}
main();