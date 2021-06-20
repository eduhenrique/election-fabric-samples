import { mainModule } from "process"
import { InitiateParticipant, Participant } from "../initiateParticipant";


async function main(){
    let initiateParticipant = new InitiateParticipant();

    let hercules = new Participant();
    hercules.cpf = '33312345678';
    hercules.name = 'Hercules';
    hercules.email = 'edu@edu.edu';

    await initiateParticipant.initiateParticipant('appUser', hercules);

    let alibaba = new Participant();
    alibaba.cpf = '04004044411';
    alibaba.name = 'Alibaba';
    alibaba.email = 'edu@edu.edu';

    await initiateParticipant.initiateParticipant('appUser', alibaba);

    let uber = new Participant();
    uber.cpf = '12300032110';
    uber.name = 'Uber';
    uber.email = 'edu@edu.edu';

    await initiateParticipant.initiateParticipant('appUser', uber);
}

main();