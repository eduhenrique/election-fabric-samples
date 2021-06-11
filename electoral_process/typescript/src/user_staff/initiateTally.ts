import { Contract } from 'fabric-network';
import { CryptoStuff } from "../crypto";
import { AccessPrivateKey } from '../getPrivateKey';
import { RequestContract } from '../requestContract';


async function main() {
    try {

        let key = await new AccessPrivateKey().getPrivateKey();

        let requestContract = new RequestContract()
        let [gateway, contract] = await requestContract.getContract('appUser');
    
        const result0 = await contract.submitTransaction('submitVoteTallyResult', "ELECTION0", key);
        console.log(`Tally process done - ${result0}\n`);

        // const encryptedVoteMap = JSON.parse(result0);
        // console.log('json parsed');

        // let crypto = new CryptoStuff();
        // var voteList: Array<any> = new Array();

        // await encryptedVoteMap.forEach(async value => {
        //     console.log(value['Record']);
        //     let encryptedVote =  value['Record'];
        //     console.log('encryptedVote \n' + encryptedVote);
        //     let rawVote = await crypto.aesGcmDecrypt(encryptedVote.encryptedVoteHash, key);
        //     console.log('\nrawVote \n' + rawVote);
        //     let vote = JSON.parse(rawVote);
        //     voteList.push(vote);
        //     console.log('\n 1st Voter Hash \n' + vote.voterHash)
        // });
        // let voteList = await createVoteList(encryptedVoteMap, key);

        // console.log('\n ue', voteList.length);
        
        // voteList.forEach((vote,i) => {
        //     console.log('\nPosition ' + i + ' value ' + vote);
            
        //     console.log('\nVoter Hash \n' + vote.voterHash)
        // });

        // Disconnect from the gateway.
        gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

    async function createVoteList(encryptedVoteMap: any, key: string): Promise<Array<any>>{
        var voteList: Array<any> = new Array();
        let crypto = new CryptoStuff();

        await encryptedVoteMap.forEach(async value => {
            console.log(value['Record']);
            let encryptedVote =  value['Record'];
            console.log('encryptedVote \n' + encryptedVote);
            let rawVote = await crypto.aesGcmDecrypt(encryptedVote.encryptedVoteHash, key);
            console.log('\nrawVote \n' + rawVote);
            let vote = JSON.parse(rawVote);
            voteList.push(vote);
            console.log('\n 1st Voter Hash \n' + vote.voterHash)
        });
        return voteList;
    }

main();