#!/bin/bash

node dist/enrollAdmin && node dist/registerUser 
node dist/createCargo && node dist/createParticipante && node dist/submitCandidato
