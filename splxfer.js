require('dotenv').config();
const fs = require('fs');
const { Keypair, Connection, LAMPORTS_PER_SOL, Transaction, SystemProgram, PublicKey, ComputeBudgetProgram, sendAndConfirmRawTransaction} = require('@solana/web3.js');
const splToken = require('@solana/spl-token');

// Access command line arguments
const args = process.argv.slice(2); // Skip the first two elements
const DESTINATION_ADDRESS = args[0];
const AMOUNT = args[1]; // Convert the amount to a float
// const AMOUNT = parseFloat(args[1]); // Convert the amount to a float
const COMPUTE_UNIT_PRICE = args[2];
const COMPUTE_UNIT_LIMIT = args[3];
const TOKEN_MINT_ID = args[4];


// pick a cluster / RPC provider
// const CONNECTION_URL = process.env.DEVNET;
const CONNECTION_URL = process.env.HELIUS;
// const CONNECTION_URL = process.env.MAINNET;
// const CONNECTION_URL = process.env.TESTNET;

// Validate command line arguments
if (!DESTINATION_ADDRESS || isNaN(AMOUNT)) {
  console.error('Usage: node index.js <DESTINATION_ADDRESS> <AMOUNT> <COMPUTE_UNIT_PRICE> <COMPUTE_UNIT_LIMIT> <TOKEN_MINT_ID>');
  process.exit(1);
}

// Load the wallet file name from the .env file
const walletFileName = process.env.SOLANA_WALLET;

if (!walletFileName) {
  console.error('SOLANA_WALLET environment variable is not set.');
  process.exit(1);
}

// Read the wallet JSON file
const walletPath = `./${walletFileName}`;
if (!fs.existsSync(walletPath)) {
  console.error(`Wallet file ${walletPath} does not exist.`);
  process.exit(1);
}

const privateKeyArray = JSON.parse(fs.readFileSync(walletPath, { encoding: 'utf8' }));

// Validate the private key
if (!Array.isArray(privateKeyArray) || privateKeyArray.length === 0) {
  console.error('Invalid private key format in the wallet file.');
  process.exit(1);
}

// Create a keypair from the private key
const keypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));

const recipientPublicKey = new PublicKey(DESTINATION_ADDRESS);
const tokenMintPublicKey = new PublicKey(TOKEN_MINT_ID);

async function getTokenDecimals(connection, tokenMintPublicKey) {

  // Fetch the mint information
  const mintInfo = await splToken.getMint(
      connection,
      tokenMintPublicKey,
  );

  // mintInfo.decimals contains the number of decimals for the token
  console.log(`Decimals for token mint ${tokenMintPublicKey.toString()}:`, mintInfo.decimals);
  return mintInfo.decimals;
}

// async function setTokenTransferAmount(connection, fromTokenAccount, amount, decimals) {
//   const amountParams = {};
//   amountParams.decimals = decimals;
//   const fromAccountBalance = await splToken.getAccountInfo(connection, fromTokenAccount);
//   return Math.floor(amount * (10 ** decimals));
// }

// Establish connection
const connection = new Connection(CONNECTION_URL, 'confirmed');
async function transferSPL() {

    console.log(`preparing to send ${AMOUNT} of ${TOKEN_MINT_ID} to ${DESTINATION_ADDRESS}...`);

    const DECIMALS = await getTokenDecimals(connection, tokenMintPublicKey);
  
    // Find the sender's token account for the specific token mint
    const fromTokenAccount = await splToken.getAssociatedTokenAddress(
        tokenMintPublicKey,
        keypair.publicKey
    );
    console.log('source:', fromTokenAccount.toString(), 'owned by', keypair.publicKey.toString());

    // Find the recipient's associated token account for the specific token mint, assuming it already exists
    const toTokenAccount = await splToken.getAssociatedTokenAddress(
        tokenMintPublicKey,
        recipientPublicKey
    );
    console.log('destination:', toTokenAccount.toString(), 'owned by', recipientPublicKey.toString());
    
  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ 
      microLamports: COMPUTE_UNIT_PRICE 
  });
  const addComputeLimit = ComputeBudgetProgram.setComputeUnitLimit({ 
      units: COMPUTE_UNIT_LIMIT  
  });
  const recentBlockhashData = await connection.getLatestBlockhashAndContext({ commitment: "confirmed" });

  const transaction = new Transaction({
    blockhash: recentBlockhashData.value.blockhash,
    lastValidBlockHeight: recentBlockhashData.value.lastValidBlockHeight
  })
  .add(addComputeLimit)
  .add(addPriorityFee)
  .add(
    splToken.createTransferInstruction(
      fromTokenAccount, // source
      toTokenAccount, // destination
      keypair.publicKey, // owner
      Math.floor(AMOUNT * (10 ** DECIMALS)), // amount
      splToken.TOKEN_PROGRAM_ID // program ID
    )
  );


  // Sign the transaction
  console.log('Signing transaction');
  transaction.sign(keypair);

  // Serialize the transaction
  console.log('Serializing transaction');
  const serializedTransaction = transaction.serialize();

  // Send and confirm the raw transaction
  // modify these options to suit your needs
  const options = {
    blockhash: recentBlockhashData.value.blockhash,
    lastValidBlockHeight: recentBlockhashData.value.lastValidBlockHeight,
    commitment: "confirmed",
    maxRetries: 0, // or 1
    minContextSlot: recentBlockhashData.context.slot,
    preflightCommitment: "confirmed",
    skipPreflight: true
  };

  // Send the transaction
  console.log('Sending transaction');
  const signature = await sendAndConfirmRawTransaction(connection, serializedTransaction, 'BlockheightBasedTransactionConfirmationStrategy', options);
  console.log(`Transaction sent: https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`);
  await connection.confirmTransaction(signature, 'confirmed');
  console.log('Transaction confirmed');
}

transferSPL().catch(console.error);

