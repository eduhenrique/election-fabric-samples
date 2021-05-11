import { CryptoStuff } from "../../crypto";
import { AccessPrivateKey } from "../../getPrivateKey";
import { RequestIdentity } from "../../requestIdentity";
import { SubmitVote } from "../../submitVote";

async function main(){
    
    let id = await new RequestIdentity().main('33312345678');    
    let key = await new AccessPrivateKey().getPrivateKey();
    let voterHash = await new CryptoStuff().sha256Hashing(id, key);
    console.log('voterHash:'+voterHash);
    
    let candidateNumList = new Array<string>(
        'ELECTION0_CANDIDATE_33312345678'
    );

    let submitVote = new SubmitVote();

    submitVote.main('33312345678', voterHash, candidateNumList, key);
}
main();