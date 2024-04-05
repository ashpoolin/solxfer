# solxfer
Example script on how to use a local hot wallet to do basic transfer, with preferred config options to promote tx confirmation during times of congestion.

## Setup
1. Install the dependencies:
    $ npm install
2. create and configure a .env file (set .env example)
3. put your keypair in the folder so it can get read (or figure out the path to your relevant keypair). Replace "my_keypair.json" with a real one if you want to use that name.
4. Send a transaction.

## Usage
node index.js [TO ADDRESS] [AMOUNT IN SOL] [COMPUTE UNIT PRICE IN MICROLAMPORTS PER COMPUTE UNIT] [COMPUTE UNIT LIMIT]

## Good Luck Out There!!!
