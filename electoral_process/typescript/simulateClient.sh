#!/bin/bash

./enrollAdminUser.sh 
node dist/createPosition && node dist/user_staff/requestInitiateParticipant && ./submitCandidates.sh
