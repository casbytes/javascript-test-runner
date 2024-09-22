#!/bin/bash

# Check if the required arguments are provided
if [ $# -ne 3 ]; then
  echo "Usage: $0 <zipped-checkpoint> <github-username> <test-environment>"
  exit 1
fi

CHECKPOINT_ZIP=$1
USERNAME=$2
TEST_ENV=$3
BASE_DIR="/shared"

CHECKPOINT_FOLDER_NAME=$(basename "$CHECKPOINT_ZIP" .zip)
RESULTS_DIR="$BASE_DIR/${USERNAME}-${CHECKPOINT_FOLDER_NAME}"  
CONFIG_FILE="./vitest.config.ts"
TEST_RESULTS="$RESULTS_DIR/test-results.json"
ERRORS="$RESULTS_DIR/errors.json"

mkdir -p "$RESULTS_DIR"  || { echo "Error creating directory $RESULTS_DIR"; exit 1; }

echo "Unzipping $CHECKPOINT_ZIP..."
if ! unzip "$CHECKPOINT_ZIP" -d "$RESULTS_DIR" --strip-components=1; then
  echo "Error unzipping checkpoint." > "$ERRORS"
  exit 1
fi

cd "$RESULTS_DIR/$CHECKPOINT_FOLDER_NAME" || { echo "Directory $RESULTS_DIR/$CHECKPOINT_FOLDER_NAME does not exist"; exit 1; }

echo "Running Vitest tests in $TEST_ENV environment..."
if ! npx vitest --run --environment="$TEST_ENV" --config="$CONFIG_FILE" --reporter=json --outputFile="$TEST_RESULTS"; then
  echo "Error running tests in $TEST_ENV environment." > "$ERRORS"
fi

echo "Tests completed. Results written to $TEST_RESULTS."
