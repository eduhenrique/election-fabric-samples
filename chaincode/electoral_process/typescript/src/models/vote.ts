import { Candidate } from "./candidate";
import { Election } from "./election";

export class Vote {
    public docType?: string;
    public voterHash: string;
    public candidateNumbers: Array<string>;
    public candidates?: Array<Candidate>;
    public electionNum: string;
    public election?: Election;
}