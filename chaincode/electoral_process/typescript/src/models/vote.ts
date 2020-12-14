import { Candidate } from "./candidate";

export class Vote {
    public docType?: string;    
    public voterHash: string; // the key will be a hash?
    public candidateNum: string;
    public candidate?: Candidate;
}