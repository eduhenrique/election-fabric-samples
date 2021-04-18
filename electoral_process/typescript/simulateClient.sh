#!/bin/bash

node dist/enrollAdmin && node dist/registerUser 
node dist/createPosition && node dist/user_staff/requestInitiateParticipant && ./submitCandidates.sh
