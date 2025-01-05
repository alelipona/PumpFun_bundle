const { PublicKey, Connection, Keypair, Transaction, LAMPORTS_PER_SOL, ComputeBudgetProgram, SystemProgram, VersionedTransaction, TransactionMessage } = require("@solana/web3.js");
const base64js = require('base64-js');
const axios = require("axios");
const fs = require('fs').promises;
const fileSystem = require('fs');
const { getCurrentSlot, createAddressLookupTable, extendAddressLookupTable } = require("../utils/addressLookupTable");
const { PumpFunSDK } = require("../sdk/pumpFunSDK");
const { AnchorProvider } = require("@coral-xyz/anchor");
const bs58 = require("bs58");

const walletSecret = "dev wallet private key"; // Set wallet private key (dev private key)
const wallet = Keypair.fromSecretKey(new Uint8Array(bs58.decode(walletSecret)));

const connection = new Connection("rpc endpoint", "confirmed");

const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });

const sdk = new PumpFunSDK(provider);

// Read private keys from walletKeys.txt
async function getPublicKeysFromFile(filePath) {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const wallets = [];

        for (const line of lines) {
            try {
                const privateKey = bs58.decode(line);
                const keypair = Keypair.fromSecretKey(privateKey);
                wallets.push(keypair);
            } catch (error) {
                console.error(`Unable to process private key: ${line}`, error);
            }
        }

        return wallets;
    } catch (error) {
        console.error("Failed to read file:", error);
        return [];
    }
}

function chunkArray(arr, chunkSize) {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize));
    }
    return result;
}

function getRandomInRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function uploadImage() {
    try {
        const files = await fileSystem.promises.readdir("../config/img");
        console.log("Files in the folder:", files);
        const imageFiles = files.filter(file =>
            file.match(/\.(jpg|jpeg|png|gif)$/i)
        );

        if (imageFiles.length === 0) {
            console.log("No valid image files found in the img folder");
            return;
        }

        if (imageFiles.length > 1) {
            console.log("Multiple images found in the img folder, please keep only one image");
            return;
        }
        const imageStream = fileSystem.createReadStream(`../config/img/${imageFiles[0]}`);

        console.log("Uploading image:", imageFiles[0]);
        // Token metadata
        const createData = {
            file: imageStream,
            name: "mrhuang xiuxiu",
            symbol: "mrhuang",
            description: "mrhuang-bot",
            twitter: "https://x.com/soul55666",
            telegram: "https://x.com/soul55666",
            website: "https://x.com/soul55666",
        };

        return createData;
    } catch (err) {
        console.error("Error reading folder:", err);
    }
}

const init = async () => {
    // ca private key
    const mintPublicKey = "2EnUVrz5NWYGni5W3PMZxLi9igvZ2SSQhtyvBG8TD5bfLSNaxFhgzEQFBUQDNXJpQ289yexKS8yKsyBAJvyjgSC6";
    const mint = Keypair.fromSecretKey(new Uint8Array(bs58.decode(mintPublicKey)));

    // Default lookup table address, do not remove
    const defaultLookupPublicKey = "8GG7J73ZUgTiv8SKBjqCjQbiaJXZKuNbjm1uhK3p3Zim";
    const defaultLookup = new PublicKey(defaultLookupPublicKey);

    const SLIPPAGE_BASIS_POINTS = 500n;

    const buyAmountSol = BigInt(0.0001 * LAMPORTS_PER_SOL);

    const walletNames = await getPublicKeysFromFile("../config/walletKeys.txt");
    console.log("Number of wallets detected: ", walletNames.length);

    const walletChunks = chunkArray(walletNames, 5);
    console.log("Number of private key batches created:", walletChunks.length);

    const { lookupTableAddress, signature } = await createAddressLookupTable(connection, wallet);
    console.log("Lookup table address", lookupTableAddress.toBase58());
    console.log("Transaction signature", signature);

    // Extract wallet public keys to add to lookup table address
    const walletPublicKeys = walletNames.map(wallet => {
        if (wallet.publicKey) {
            return new PublicKey(wallet.publicKey);
        } else {
            throw new Error(`Wallet missing public key field: ${JSON.stringify(wallet)}`);
        }
    });

    // Add addresses to lookup table
    const extend = await extendAddressLookupTable(connection, wallet, lookupTableAddress, walletPublicKeys);
    console.log("Transaction signature", extend);

    // Get default lookup table account
    const defaultLookupTableAccounts = (await connection.getAddressLookupTable(defaultLookup)).value;
    if (!defaultLookupTableAccounts) {
        console.log("No valid default lookup table accounts found, stopping operation.");
        return;
    }

    const addressesFromDefaultLookupTable = defaultLookupTableAccounts.state.addresses;
    if (addressesFromDefaultLookupTable.length === 0) {
        console.log("No valid addresses in the default lookup table, stopping operation.");
        return;
    }

    const customLookupTableAccounts = (await connection.getAddressLookupTable(lookupTableAddress)).value;
    if (!customLookupTableAccounts) {
        console.log("No valid custom lookup table accounts found, stopping operation.");
        return;
    }
    const addressesFromCustomLookupTable = customLookupTableAccounts.state.addresses;
    if (addressesFromCustomLookupTable.length === 0) {
        console.log("No valid addresses in the custom lookup table, stopping operation.");
        return;
    }

    const metaImage = await uploadImage();
    if (!metaImage) {
        console.log("No valid image file found");
        return;
    }

    let allTransactions = [];
    let jitoTx = new Transaction();

    // Get block hash
    const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    console.log("Block hash:", latestBlockhash.blockhash);

    const metadata = await sdk.createAndBuy(wallet, mint, metaImage, buyAmountSol, SLIPPAGE_BASIS_POINTS, 'confirmed');
    
    jitoTx.add(metadata);

    const jitoTipAccounts = [
        "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
        "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
        "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
        "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
        "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
        "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
        "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT",
        "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
    ];

    const randomIndex = Math.floor(Math.random() * jitoTipAccounts.length);
    const randomJitoTipAccount = jitoTipAccounts[randomIndex];

    console.log("Randomly selected tip wallet address:", randomJitoTipAccount);

    const transferInstruction = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,                   // Wallet address
        toPubkey: new PublicKey(randomJitoTipAccount),  // Tip wallet address
        lamports: 0.0001 * LAMPORTS_PER_SOL,            // Tip amount
    });

    jitoTx.add(transferInstruction);

    const messageJito = new TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: jitoTx.instructions,
    }).compileToV0Message();

    const transactionJito = new VersionedTransaction(messageJito);

    // Sign v0 transaction
    transactionJito.sign([wallet, mint]);
    
    for (let chunkIndex = 0; chunkIndex < walletChunks.length; chunkIndex++) {
        const chunk = walletChunks[chunkIndex];
        console.log("Processing batch", chunkIndex + 1, "of wallets");
        let chunkTx = new Transaction();
        for (let i = 0; i < chunk.length; i++) {

            const keypair = chunk[i];
            // Random percentage between 10 and 25
            const randomPercent = getRandomInRange(10, 25);

            // (e.g., buy amount ± random percentage)
            const buyAmountSolWithRandom = buyAmountSol / BigInt(100) * BigInt(randomPercent % 2 ? (100 + randomPercent) : (100 - randomPercent));

            console.log(buyAmountSolWithRandom);
            
            const instruction = await sdk.getBuyInstructionsBySolAmount(
                keypair.publicKey,                        // Buyer's address
                mint.publicKey,                           // Target token's mint address
                buyAmountSolWithRandom,                   // Amount of SOL needed to buy
                SLIPPAGE_BASIS_POINTS,                    // Maximum slippage allowed is 5%
                'confirmed'                               // Confirmation level is confirmed
            );
            
            instruction.instructions.forEach((instruction) => {

                chunkTx.add(instruction);
            });


        }

        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 });
        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 0.00001 * LAMPORTS_PER_SOL });
        chunkTx.add(modifyComputeUnits, addPriorityFee);  // Add priority fee instruction

        const message = new TransactionMessage({
            payerKey: chunk[0].publicKey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions: chunkTx.instructions,
        }).compileToV0Message([customLookupTableAccounts, defaultLookupTableAccounts]);

        const transactionV0 = new VersionedTransaction(message);
        const serializedMsg = transactionV0.serialize();
        console.log("Transaction size:", serializedMsg.length);

        if (serializedMsg.length > 1232) {
            console.log("Transaction too large");
        }

        // Sign v0 transaction
        transactionV0.sign([...chunk]);

        allTransactions.push(transactionV0);

    }
    
    const base58JitoFeeTx = bs58.encode(transactionJito.signatures[0])
    const base58Transaction = bs58.encode(transactionJito.serialize())
    
    
    const jitoTransactions = [base58Transaction]
    for (let i = 0; i < allTransactions.length; i++) {
        const serializedTransaction = bs58.encode(allTransactions[i].serialize())
        jitoTransactions.push(serializedTransaction)
    }

    console.log("Completed creating transaction batches, starting submission to Jito:", allTransactions.length);


    try {
        const url = "https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/bundles"
        const data = {
            jsonrpc: "2.0",
            id: 1,
            method: "sendBundle",
            params: [jitoTransactions]
        };
        const headers = {
            'Content-Type': 'application/json'
        }
        
        const startTime = Date.now();
        const jito = await axios.post(url, data, { headers });
        
        const endTime = Date.now();
        const timeTaken = endTime - startTime;

        console.log("Submission successful:", jito.data);
        
        const confirmation = await connection.confirmTransaction({
            signature: base58JitoFeeTx,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            blockhash: latestBlockhash.blockhash,
        });
        console.log("Transaction confirmation:", confirmation);
        console.log(`Request took: ${timeTaken} ms`);
    } catch (error) {
        if (error.response) {
            console.error('Error response:', error.response.data);
            if (error.response.data.error) {
                console.error('Error code:', error.response.data.error.code);
                console.error('Error message:', error.response.data.error.message);
                console.error('Error details:', error.response.data.error.details);
            }
        } else if (error.request) {
            console.error('Request made but no response received:', error.request);
        }
    }
};

init();
