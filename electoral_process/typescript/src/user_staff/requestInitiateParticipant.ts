import { mainModule } from "process"
import { InitiateParticipant, Participant } from "../initiateParticipant";


async function main(){
    let initiateParticipant = new InitiateParticipant();

    let participant = new Participant();
    participant.cpf = '33312345678';
    participant.dname = 'Hercules';
    participant.email = 'edu@edu.edu';

    initiateParticipant.initiateParticipant('appUser', participant);
}

main();