#!/bin/bash

node dist/enrollAdmin && node dist/user_staff/registerStaffUser 
node dist/createPosition && node dist/user_staff/requestInitiateParticipant && ./submitCandidates.sh
