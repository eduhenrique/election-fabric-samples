import { Participant } from "./participant";
import {Position} from "./position"

export class Candidate {
    public docType?: string;
    public name: string;
    public proposal?: string;
    public participantNum: string;
    public participant?: Participant;
    public positionNum: string;
    public position?: Position;
}