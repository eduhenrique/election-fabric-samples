import { CryptoStuff } from "../../crypto";
import { AccessPrivateKey } from "../../getPrivateKey";
import { RequestIdentity } from "../../requestIdentity";
import { SubmitVote } from "../../submitVote";

async function main(){
    
    let id = await new RequestIdentity().main('04004044411');    
    let key = await new AccessPrivateKey().getPrivateKey();
    let crypto = new CryptoStuff();
    let voterHash = await crypto.sha256Hashing(id, key);
    let securedHash = await crypto.aesGcmEncrypt(voterHash, key);
    console.log('voterHash:  '+voterHash);
    console.log('\nsecuredHash:  '+securedHash);
    
    let candidateNumList = new Array<string>(
        'ELECTION0_CANDIDATE_33312345678'
    );

    let submitVote = new SubmitVote();

    submitVote.main('04004044411', securedHash, candidateNumList, key);
}
main();