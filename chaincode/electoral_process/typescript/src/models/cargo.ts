import { Eleicao } from "./eleicao";


export class Cargo {
    public docType?: string;
    public nome: string;
    public eleicaoNum: string;
    public eleicao?: Eleicao;
}