import { Election } from "./election";


export class Position {
    public docType?: string;
    public name: string;
    public electionNum: string;
    public election?: Election;
}