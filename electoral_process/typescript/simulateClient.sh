#!/bin/bash

node dist/enrollAdmin && node dist/registerUser 
node dist/createPosition && node dist/initiateParticipant && node dist/submitCandidate
