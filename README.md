# solxfer
Example script on how to use a local hot wallet to do a basic token transfer, with preferred config options to promote tx confirmation during times of congestion.

## Description
There are two scripts, one for sending SOL, another for sending SPL tokens. 
* solxfer.js = send SOL
* splxfer.js = send SPL

Warning: The scripts are pretty rough around the edges, SO USE AT YOUR OWN RISK. TEST FIRST. THERE ARE ZERO SAFETY CHECKS TO ENSURE YOU ARE SENDING TO THE CORRECT ADDRESS, OR THE CORRECT AMOUNT. PRACTICE ON DEVNET. I AM NOT RESPONSIBLE FOR WHAT YOU DO WITH THIS CODE. Thanks :)

## Setup
1. Install the dependencies:  
    `$ npm install`
2. create and configure a .env file (see .env_example)
3. put your keypair in the folder so it can get read (or figure out the path to your relevant keypair). Replace "my_keypair.json" with a real one if you want to use that name.
4. Send a transaction.

## Usage
```bash
$ node solxfer.js [TO ADDRESS] [UI AMOUNT IN SOL] [COMPUTE UNIT PRICE IN MICROLAMPORTS PER COMPUTE UNIT] [COMPUTE UNIT LIMIT]  
$ node splxfer.js [TO ADDRESS] [UI AMOUNT IN SPL TOKEN] [COMPUTE UNIT PRICE IN MICROLAMPORTS PER COMPUTE UNIT] [COMPUTE UNIT LIMIT] [TOKEN_MINT_ID]  
```
## Good Luck Out There!!!
