import { parse } from "path";
import { AccessPrivateKey } from "../getPrivateKey";

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


// Setting for Hyperledger Fabric
const { Wallets, FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const walletPath = process.env.WALLET_PATH;

// load the network configuration
const ccpPath = process.env.CONFIGURATION_PATH;
// const ccpPath = path.resolve(__dirname, '..', '..', '..', '..','test-network','organizations','peerOrganizations','org1.example.com', 'connection-org1.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

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
        // Create a new file system based wallet for managing identities.        
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.get('appUser');
        if (!userExists) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();        
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('electoral_process');

        const result = await contract.evaluateTransaction('queryAllElections');
        console.log(`Resultado RichQuery ALL Elections - ` +`${result.toString()}\n`);

        // Evaluate the specified transaction.
        // const result = await contract.evaluateTransaction('queryAllProducts');
        // console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.status(200).json(JSON.parse(result.toString()));

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
        // Create a new file system based wallet for managing identities.        
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.get('appUser');
        if (!userExists) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();        
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('electoral_process');

        let cpf = req.query.cpf;
        const result = await contract.evaluateTransaction('queryAsset', cpf);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}\n`);

        res.status(200).json({response: result.toString()});

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

        // Create a new file system based wallet for managing identities.        
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.get('appUser');
        if (!userExists) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();        
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });
                
        console.log(JSON.stringify(req.query) +'\n');
        console.log(JSON.stringify(req.query.cpf) +'\n');
        console.log(JSON.stringify(req.query.name) +'\n');
        console.log(JSON.stringify(req.query.email) +'\n');
        
        let hercules = {
            cpf: req.query.cpf,
            name: req.query.name,
            email: req.query.email
        };

        console.log('Hercules' + JSON.stringify(hercules) +'\n');

        await new initiateParticipant.InitiateParticipant().initiateParticipant('appUser', hercules);

        console.log(`Participant has been created`);
        res.send('Participant has been created');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).send('Something broke!\n' + error);
    }
});

/**
 * @swagger
 * /requestCandidacy:
 *   post:
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
app.post('/requestCandidacy/', async function (req, res) {
    //get requestCandidacy to assembly the page for user, them the post request to proceed 
    try {
        // Create a new file system based wallet for managing identities.        
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        
        let cpf: string = req.query.cpf;

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.get(cpf);
        if (!userExists) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();        
        await gateway.connect(ccp, { wallet, identity: cpf, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('electoral_process');

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
        // Create a new file system based wallet for managing identities.        
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        
        let cpf: string = req.body.cpf;
        console.log(JSON.stringify(req.body));
        console.log('cpf'+ cpf);
        // Check to see if we've already enrolled the user.
        const userExists = await wallet.get(cpf);
        if (!userExists) {
            console.log('An identity for the user '+cpf+' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            res.status(401).send('An identity for the user '+cpf+' does not exist in the wallet');
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();        
        await gateway.connect(ccp, { wallet, identity: cpf, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('electoral_process');

        let key = await new AccessPrivateKey().getPrivateKey();
        let requestSecuredHash: string = req.body.token;
        let positionNumber: string = req.body.position;
        let proposal: string = req.body.proposal;

        const result = await contract.submitTransaction('submitCandidate', positionNumber, proposal, requestSecuredHash, key);
        console.log(`Candidate has been submitted - `+`${result.toString()}\n`);
        res.send('Candidacy completed.');

        res.status(200).json({response: result.toString()});
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to request candidacy: ${error}`);
        res.status(500).send('Something broke!\n' + error);
    }
});

app.get('/api/requestVote/', async function (req, res) {
    try {
        // Create a new file system based wallet for managing identities.        
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        
        let cpf: string = req.query.cpf;
        let electionNum = req.query.electionNum;

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.get(cpf);
        if (!userExists) {
            console.log('An identity for the user ' + cpf + ' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();        
        await gateway.connect(ccp, { wallet, identity: cpf, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('electoral_process');
        

        const result = await contract.evaluateTransaction('requestVote', electionNum);        
        res.send('Request has been sent to the registered email.');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
});

app.get('/api/getElectionForm', async function (req, res) {
    try {
        // Create a new file system based wallet for managing identities.        
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        let cpf: string = req.query.cpf;
        let electionNum = req.query.electionNum;
        let token = req.query.token;

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.get(cpf);
        if (!userExists) {
            console.log('An identity for the user ' + cpf + ' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();        
        await gateway.connect(ccp, { wallet, identity: cpf, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('electoral_process');
        //'ELECTION0'
        const result = await contract.evaluateTransaction('queryAllPositionsByElection', electionNum);
        console.log(`Resultado RichQuery ALL Positions - ` +`${result.toString()}\n`);
        
        res.status(200).json({response: result.toString()});

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});


app.listen(5000, 'localhost');
console.log('Running on http://localhost:5000');
