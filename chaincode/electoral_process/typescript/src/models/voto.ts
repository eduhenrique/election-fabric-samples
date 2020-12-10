import { Candidato } from "./candidato";

export class Voto {
    public docType?: string;    
    public eleitorHash: string; // a key será o hash?
    public candidatoNum: string;
    public candidato?: Candidato;
}