import { AccessPrivateKey } from '../getPrivateKey';
import { RequestContract } from '../requestContract';


async function main() {
    try {

        let key = await new AccessPrivateKey().getPrivateKey();

        let requestContract = new RequestContract()
        let [gateway, contract] = await requestContract.getContract('appUser');
    
        const result0 = await contract.submitTransaction('submitVoteTallyResult', "ELECTION0", key);
        console.log(`Tally process done - ${result0}\n`);

        // Disconnect from the gateway.
        gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();