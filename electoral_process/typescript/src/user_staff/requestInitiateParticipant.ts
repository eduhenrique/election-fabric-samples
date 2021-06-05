import { mainModule } from "process"
import { InitiateParticipant, Participant } from "../initiateParticipant";


async function main(){
    let initiateParticipant = new InitiateParticipant();

    let hercules = new Participant();
    hercules.cpf = '33312345678';
    hercules.dname = 'Hercules';
    hercules.email = 'edu@edu.edu';

    await initiateParticipant.initiateParticipant('appUser', hercules);

    let alibaba = new Participant();
    alibaba.cpf = '04004044411';
    alibaba.dname = 'Alibaba';
    alibaba.email = 'edu@edu.edu';

    await initiateParticipant.initiateParticipant('appUser', alibaba);
}

main();