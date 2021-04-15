import { Election } from "./election";

export class EncryptedVote {
    public docType?: string;    
    public token: string;
    public voterHash: string;
    public electionNum: string;
    public election?: Election;
}