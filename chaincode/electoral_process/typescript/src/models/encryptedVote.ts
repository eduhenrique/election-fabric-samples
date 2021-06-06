import { Election } from "./election";

export class EncryptedVote {
    public docType?: string;    
    public encryptedVoteHash: string;
    public electionNum: string;
    public election?: Election;
}