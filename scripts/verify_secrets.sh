#!/bin/bash

# GFTB Security Diagnostic Utility
# This script verifies that the INTERNAL_API_KEY is consistent across all microservices.

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "--- GFTB Internal Security Audit ---"

SERVICES=("passport-service" "iot-service" "blockchain-service")
PROJECT_KEY=""
MISMATCH=0

for SERVICE in "${SERVICES[@]}"; do
    echo -n "Checking $SERVICE... "
    # Note: This requires railway CLI to be logged in
    KEY=$(railway variables --service "$SERVICE" --json | jq -r '.INTERNAL_API_KEY')
    
    if [ -z "$KEY" ] || [ "$KEY" == "null" ]; then
        echo -e "${RED}MISSING${NC}"
        MISMATCH=1
        continue
    fi

    if [ -z "$PROJECT_KEY" ]; then
        PROJECT_KEY="$KEY"
        echo -e "${GREEN}FOUND${NC}"
    elif [ "$PROJECT_KEY" == "$KEY" ]; then
        echo -e "${GREEN}MATCH${NC}"
    else
        echo -e "${RED}MISMATCH${NC}"
        MISMATCH=1
    fi
done

if [ $MISMATCH -eq 0 ]; then
    echo -e "\n${GREEN}SUCCESS:${NC} All internal services are synchronized."
else
    echo -e "\n${RED}FAILURE:${NC} Security sync check failed. Please review Railway environment variables."
    exit 1
fi
