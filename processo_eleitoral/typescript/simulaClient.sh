#!/bin/bash

node dist/enrollAdmin && node dist/registerUser 
node dist/createCargo && node dist/initiateParticipante && node dist/submitCandidato
