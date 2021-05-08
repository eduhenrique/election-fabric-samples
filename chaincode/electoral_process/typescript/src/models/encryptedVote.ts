import { Election } from "./election";

export class EncryptedVote {
    public docType?: string;    
    public encryptedVote: string;
    public voterHash: string;
}