import { parse } from "path";
import { AccessPrivateKey } from "../getPrivateKey";
import { RequestContract } from "../requestContract";

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();
app.use(bodyParser.json());

const swaggerOptions = {
    swaggerDefinition: {
      info: {
        version: "1.0.0",
        title: "Blockchain Election API",
        description: "Blockchain Election API Information",
        contact: {
          name: "Amazing Developer"
        },
        servers: ["http://localhost:5000"]
      }
    },
    // ['.routes/*.js']
    apis: ["dist/server/electionServer.js"]
  };
  
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
/**
 * @swagger
 * /elections:
 *  get:
 *    tags:
 *       - Election
 *    description: Use to request all elections
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.get('/elections', async (req, res) => {
    try {     
        let requestContract = new RequestContract()
        let [gateway, contract] = await requestContract.getContract('appUser');

        const result = await contract.evaluateTransaction('queryAllElections');
        console.log(`Resultado RichQuery ALL Elections - ` +`${result.toString()}\n`);

        res.status(200).json(JSON.parse(result.toString()));
        
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});

/**
 * @swagger
 * /participant:
 *  get:
 *    tags:
 *       - Participant
 *    description: Creates a new participant
 *    produces:
 *       - application/json
 *    parameters:
 *       - name: cpf
 *         description: cpf information
 *         in: query
 *         required: true
 *         schema:
 *              type: string
 *         example: 33312345678
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.get('/participant/', async function (req, res) {
    try {
        let requestContract = new RequestContract()
        let [gateway, contract] = await requestContract.getContract('appUser');

        let cpf = req.query.cpf;
        const result = await contract.evaluateTransaction('queryAsset', cpf);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}\n`);

        res.status(200).json(JSON.parse(result.toString()));
        
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to query participant: ${error}`);
        res.status(500).send('Something broke!\n' + error);
    }
});

/**
 * @swagger
 * /participant:
 *   post:
 *     tags:
 *       - Participant
 *     description: Creates a new participant
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: cpf
 *         description: cpf information
 *         in: query
 *         required: true
 *         schema:
 *              type: string
 *       - name: name
 *         description: name information
 *         in: query
 *         required: true
 *         schema:
 *              type: string
 *       - name: email
 *         description: email information
 *         in: query
 *         required: true
 *         schema:
 *              type: string
 *     responses:
 *       200:
 *         description: Successfully created
 */
app.post('/participant/', async function (req, res) {
    try {
        let initiateParticipant = require('../initiateParticipant');
        
        let hercules = {
            cpf: req.query.cpf,
            name: req.query.name,
            email: req.query.email
        };

        await new initiateParticipant.InitiateParticipant().initiateParticipant('appUser', hercules);

        console.log(`Participant has been created`);
        res.send('Participant has been created');
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).send('Something broke!\n' + error);
    }
});

/**
 * @swagger
 * /requestCandidacy:
 *   get:
 *     tags:
 *       - Candidacy
 *     description: Participant requests to be a candidate
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: cpf
 *         description: cpf information
 *         in: query
 *         required: true
 *         schema:
 *              type: string
 *       - name: electionNum
 *         description: election key
 *         in: query
 *         required: true
 *         schema:
 *              type: string
 *     responses:
 *       200:
 *         description: Successfully created
 */
app.get('/requestCandidacy/', async function (req, res) {
    //get requestCandidacy to assembly the page for user, them the post request to proceed 
    try {
        let cpf: string = req.query.cpf;

        let requestContract = new RequestContract()
        let [gateway, contract] = await requestContract.getContract(cpf);

        let electionNum = req.query.electionNum;
        let key = await new AccessPrivateKey().getPrivateKey();

        const result0 = await contract.submitTransaction('requestCandidacy', electionNum, key);
        console.log(`Candidate request - `+`${result0.toString()}\n`);
        res.send('Candidate request complete. Check your email to continue the process');
        
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {        
        console.error(`Failed to request candidacy: ${error}`);
        res.status(500).send('Something broke!\n' + error);
    }
});

/**
 * @swagger
 * /submitToCandidacy:
 *   post:
 *      tags:
 *        - Candidacy
 *      description: Participant submit to candidacy
 *      consumes:
 *        - application/json
 *      parameters:
 *        - in: body
 *          name: candidateSubmitted
 *          description: Participant submit to candidacy xD
 *          schema:
 *            type: object
 *            required:
 *              - cpf
 *              - token
 *              - position
 *              - proposal
 *            properties:
 *              cpf:
 *                type: string
 *              token:
 *                type: string
 *              position:
 *                type: string
 *              proposal:
 *                type: string
 *      responses:
 *          200:
 *              description: Successfully created
 */
app.post('/submitToCandidacy/', async function (req, res) {
    try {
        let cpf: string = req.body.cpf;
        
        let requestContract = new RequestContract()
        let [gateway, contract] = await requestContract.getContract(cpf);

        let key = await new AccessPrivateKey().getPrivateKey();
        let requestSecuredHash: string = req.body.token;
        let positionNumber: string = req.body.position;
        let proposal: string = req.body.proposal;

        const result = await contract.submitTransaction('submitCandidate', positionNumber, proposal, requestSecuredHash, key);
        console.log(`Candidate has been submitted - `+`${result.toString()}\n`);

        res.send({response: result.toString()});
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to request candidacy: ${error}`);
        res.status(500).send('Something broke!\n' + error);
    }
});

/**
 * @swagger
 * /requestVote:
 *   get:
 *     tags:
 *       - Vote
 *     description: Participant requests access to the vote
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: cpf
 *         description: cpf information
 *         in: query
 *         required: true
 *         schema:
 *              type: string
 *       - name: electionNum
 *         description: election key
 *         in: query
 *         required: true
 *         schema:
 *              type: string
 *     responses:
 *       200:
 *         description: Successfully created
 */
app.get('/requestVote/', async function (req, res) {
    try {
        let cpf: string = req.query.cpf;
        let electionNum = req.query.electionNum;
        
        let requestContract = new RequestContract()
        let [gateway, contract] = await requestContract.getContract(cpf);

        let key = await new AccessPrivateKey().getPrivateKey();
        const result = await contract.evaluateTransaction('requestVote', electionNum, key);

        console.log(`Voter request - `+`${result.toString()}\n`);        
        res.send('Voter request complete. Check your email to continue the process');
        
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to request vote: ${error}`);
        res.status(500).send('Something broke!\n' + error);
    }
});

/**
 * @swagger
 * /submitVote:
 *   post:
 *      tags:
 *        - Vote
 *      description: Participant submits the vote
 *      consumes:
 *        - application/json
 *      parameters:
 *        - in: body
 *          name: candidateSubmitted
 *          description: Participant submits the vote xD
 *          schema:
 *            type: object
 *            required:
 *              - cpf
 *              - token
 *              - candidates
 *            properties:
 *              cpf:
 *                type: string
 *              token:
 *                type: string
 *              candidates:
 *                type: string
 *      responses:
 *          200:
 *              description: Successfully created
 */
app.post('/submitVote/', async function (req, res) {
    try {
        let cpf: string = req.body.cpf;
        
        let requestContract = new RequestContract()
        let [gateway, contract] = await requestContract.getContract(cpf);

        let key = await new AccessPrivateKey().getPrivateKey();
        let requestSecuredHash: string = req.body.token;
        let candidates: string = req.body.candidates;

        const result = await contract.submitTransaction('submitVote', requestSecuredHash, candidates, key);
        console.log(`Vote has been submitted - `+`${result.toString()}\n`);

        res.send({response: result.toString()});
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit the vote: ${error}`);
        res.status(500).send('Something broke!\n' + error);
    }
});

/**
 * @swagger
 * /submitVoteTallyResult:
 *   post:
 *     tags:
 *       - Result
 *     description: Start the tally process to get the results
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: electionNum
 *         description: election key
 *         in: query
 *         required: true
 *         schema:
 *              type: string
 *     responses:
 *       200:
 *         description: Successfully created
 */
app.post('/submitVoteTallyResult', async (req, res) => {
    try {
        let requestContract = new RequestContract()
        let [gateway, contract] = await requestContract.getContract('appUser');

        let key = await new AccessPrivateKey().getPrivateKey();
        let electionNum: string = req.query.electionNum;        

        const result = await contract.submitTransaction('submitVoteTallyResult', electionNum, key);
        console.log(`The tally has been completed - `+`${result.toString()}\n`);

        res.status(200).json(JSON.parse(result.toString()));
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed process the tally step: ${error}`);
        res.status(500).send('Something broke!\n' + error);
    }
});

/**
 * @swagger
 * /electionResult:
 *  get:
 *    tags:
 *       - Result
 *    description: Use to request the Election Result
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.get('/electionResult', async (req, res) =>{
    try{
        let requestContract = new RequestContract()
        let [gateway, contract] = await requestContract.getContract('appUser');

        const result = await contract.evaluateTransaction('queryAsset', 'voteList_ELECTION0');

        console.log(`Election result - `+`${result.toString()}\n`);        
        res.status(200).json(JSON.parse(result.toString()));
        
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed process the tally step: ${error}`);
        res.status(500).send('Something broke!\n' + error);
    }
});

// app.get('/api/getElectionForm', async function (req, res) {
//     try {
//         let cpf: string = req.query.cpf;
//         let electionNum = req.query.electionNum;
//         let token = req.query.token;
       
//         let requestContract = new RequestContract()
//         let [gateway, contract] = await requestContract.getContract('appUser');

//         //'ELECTION0'
//         const result = await contract.evaluateTransaction('queryAllPositionsByElection', electionNum);
//         console.log(`Resultado RichQuery ALL Positions - ` +`${result.toString()}\n`);
        
//         res.status(200).json({response: result.toString()});
//         // Disconnect from the gateway.
//         await gateway.disconnect();

//     } catch (error) {
//         console.error(`Failed to evaluate transaction: ${error}`);
//         res.status(500).json({error: error});
//     }
// });


app.listen(5000, 'localhost');
console.log('Running on http://localhost:5000');
