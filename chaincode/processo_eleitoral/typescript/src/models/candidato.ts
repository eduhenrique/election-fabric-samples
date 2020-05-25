import { Cargo } from "./cargo";
import { Participante } from "./participante";

export class Candidato {
    public docType?: string;
    public nome: string;
    public participanteNum: string;
    public participante?: Participante;
    public cargoNum: string;
    public cargo?: Cargo;
}