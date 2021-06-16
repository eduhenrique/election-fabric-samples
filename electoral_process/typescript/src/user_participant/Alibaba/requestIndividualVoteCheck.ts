import { CryptoStuff } from "../../crypto";
import { AccessPrivateKey } from "../../getPrivateKey";
import { RequestIdentity } from "../../requestIdentity";
import { IndividualVerifiability } from "../../individualVerifiability";

async function main(){
    
    let id = await new RequestIdentity().main('04004044411');    
    let key = await new AccessPrivateKey().getPrivateKey();
    let crypto = new CryptoStuff();
    let voterHash = await crypto.sha256Hashing(id, key);
    let securedHash = await crypto.aesGcmEncrypt(voterHash, key);

    console.log('\nsecuredHash:  '+securedHash);
    
    let verifyVote = new IndividualVerifiability();
    let electionNum = 'ELECTION0'

    verifyVote.main('04004044411', electionNum, securedHash, key);
}
main();