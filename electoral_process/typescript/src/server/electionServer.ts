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
 * /example:
 *  get:
 *    description: Use to request all customers
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.get("/example", (req, res) => {
    res.status(200).send("Customer results");
  });

/**
 * @swagger
 * /elections:
 *  get:
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

app.get('/api/queryParticipant', async function (req, res) {
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

        let cpf = req.query.cpf;

        const result = await contract.evaluateTransaction('queryAsset', cpf);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}\n`);

        res.status(200).json({response: result.toString()});

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});

/**
 * @swagger
 * definitions:
 *   Participant:
 *     properties:
 *       cpf:
 *          type: string
 *       name:
 *          type: string
 *       email:
 *          type: string
 */

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

//get requestCandidacy to assembly the page for user, them the post request to proceed
app.post('/api/requestCandidacy/', async function (req, res) {
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

        const result0 = await contract.submitTransaction('requestCandidacy');
        console.log(`Candidate request - `+`${result0.toString()}\n`);
        
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
});

app.post('/api/submitToCandidate/', async function (req, res) {
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

        let token: string = req.query.token;
        let position: string = req.body.position;
        let proposal: string = req.body.proposal;

        const result0 = await contract.submitTransaction('submitCandidate', position, proposal);
        console.log(`Candidate on position0 has been submitted - `+`${result0.toString()}\n`);

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
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

// app.post('/api/addproduct/', async function (req, res) {
//     try {

//         // Create a new file system based wallet for managing identities.
//         const walletPath = path.resolve(__dirname, '.', 'wallet');
//         const wallet = await Wallets.newFileSystemWallet(walletPath);
//         console.log(`Wallet path: ${walletPath}`);

//         // Check to see if we've already enrolled the user.
//         const userExists = await wallet.get('appUser');
//         if (!userExists) {
//             console.log('An identity for the user "appUser" does not exist in the wallet');
//             console.log('Run the registerUser.js application before retrying');
//             return;
//         }

//         // Create a new gateway for connecting to our peer node.
//         const gateway = new Gateway();
//         await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

//         // Get the network (channel) our contract is deployed to.
//         const network = await gateway.getNetwork('channeldemo');

//         // Get the contract from the network.
//         const contract = network.getContract('becc');

//         // Submit the specified transaction.
//         await contract.submitTransaction('createProduct', req.body.productnumber, req.body.brand, req.body.price, req.body.count);
//         console.log('Transaction has been submitted');
//         res.send('Transaction has been submitted');

//         // Disconnect from the gateway.
//         await gateway.disconnect();

//     } catch (error) {
//         console.error(`Failed to submit transaction: ${error}`);
//         process.exit(1);
//     }
// })

// app.put('/api/changeprice/:product_number', async function (req, res) {
//     try {

//         // Create a new file system based wallet for managing identities.
//         const walletPath = path.resolve(__dirname, '.', 'wallet');
//         const wallet = await Wallets.newFileSystemWallet(walletPath);
//         console.log(`Wallet path: ${walletPath}`);

//         // Check to see if we've already enrolled the user.
//         const userExists = await wallet.get('appUser');
//         if (!userExists) {
//             console.log('An identity for the user "appUser" does not exist in the wallet');
//             console.log('Run the registerUser.js application before retrying');
//             return;
//         }

//         // Create a new gateway for connecting to our peer node.
//         const gateway = new Gateway();
//         await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

//         // Get the network (channel) our contract is deployed to.
//         const network = await gateway.getNetwork('channeldemo');

//         // Get the contract from the network.
//         const contract = network.getContract('becc');

//         // Submit the specified transaction.
//         await contract.submitTransaction('changeProductPrice', req.params.product_number, req.body.price);
//         console.log('Transaction has been submitted');
//         res.send('Transaction has been submitted');

//         // Disconnect from the gateway.
//         await gateway.disconnect();

//     } catch (error) {
//         console.error(`Failed to submit transaction: ${error}`);
//         process.exit(1);
//     }	
// })

app.listen(5000, 'localhost');
console.log('Running on http://localhost:5000');
