import { CryptoStuff } from "../../crypto";
import { RequestIdentity } from "../../requestIdentity";
import { SubmitVote } from "../../submitVote";

async function main(){
    
    let id = await new RequestIdentity().main('33312345678');
    console.log(id);
    let voterHash = new CryptoStuff().sha256Hashing(id)
    console.log('voterHash:\n'+voterHash);
    
    let candidateNumList = new Array<string>(
        'ELECTION0_CANDIDATE_33312345678'
    );

    let submitVote = new SubmitVote();

    submitVote.main('33312345678', voterHash, candidateNumList);
}
main();