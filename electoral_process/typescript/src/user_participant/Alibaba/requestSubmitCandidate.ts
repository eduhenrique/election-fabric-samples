import { CryptoStuff } from "../../crypto";
import { AccessPrivateKey } from "../../getPrivateKey";
import { RequestIdentity } from "../../requestIdentity";
import { SubmitCandidate } from "../../submitCandidate";

async function main(){
    let id = await new RequestIdentity().main('33312345678');
    let key = await new AccessPrivateKey().getPrivateKey();
    let crypto = new CryptoStuff();
    let voterHash = await crypto.sha256Hashing(id, key);
    let securedHash = await crypto.aesGcmEncrypt(voterHash, key);


    let submitCandidate = new SubmitCandidate();
    submitCandidate.main('04004044411', 'POSITION0', 'XD - Prometo Mangás e Novels de qualdiade para todos.', securedHash, key);
}
main();