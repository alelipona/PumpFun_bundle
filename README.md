# PumpFun_bundle

Pumpfun multi-wallet bundle transactions based on the Solana blockchain, supporting token creation, bundled buying/selling, and address table optimization methods.

## Features

- 🪙 **Token Creation:** Supports custom token names, symbols, and images.
- 💰 **Bundled Transactions:** Supports bundled buying/selling operations with 21 wallets.
- 📊 **Address Optimization:** Integrates Address Lookup Table (ALT) to reduce transaction fees.
- ⚡ **MEV Protection:** Integrates Jito MEV-Boost to improve transaction success rates.
- 🔄 **Automation:** Fully automated transaction process.
- 🛡️ **Slippage Protection:** Built-in slippage protection mechanism.

## Project Structure

```
PumpFun_bundle/
├── src/                    # Source code directory
│   ├── sdk/               # SDK core implementation
│   │   └── pumpFunSDK.js  # Pump Fun protocol SDK implementation
│   ├── utils/             # Utility functions
│   │   └── addressLookupTable.js  # Address lookup table utility
│   ├── scripts/           # Execution scripts
│   │   ├── tokenCreateAndBuy.js   # Create and buy tokens
│   │   ├── tokenSell.js           # Sell tokens
│   │   └── addressTableManager.js  # Address table management
│   └── IDL/               # Interface definitions
│       ├── pumpFunProtocol.json   # Protocol interface definition
│       └── protocolExport.js      # Export interface
└── config/                # Configuration files directory
    ├── img/              # Token images directory
    ├── walletKeys.txt    # Wallet private key file
    └── lookupTable.txt   # Address lookup table configuration
```

## Installation Instructions

1. Clone the project
```
git clone https://github.com/your-repo/PumpFun_bundle.git
```

2. Install dependencies
```
npm install
```

3. Configure wallet private key and address lookup table
```
Create configuration directory
mkdir -p config/img
Add private key file
touch config/walletKeys.txt
Add token images
cp your_token_image.png config/img/
```

## Usage Instructions

1. Create and buy tokens
```
node src/scripts/tokenCreateAndBuy.js
```

2. Sell tokens
```
node src/scripts/tokenSell.js
```

3. Address table management
```
node src/scripts/addressTableManager.js
```

## Configuration Instructions

1. Wallet private key: config/walletKeys.txt
```
[Private Key of Wallet 1]
…………………………
[Private Key of Wallet 20]
```

2. Token images
- Place token images in the `config/img/` directory
- Supports jpg, jpeg, png, gif formats

3. RPC Configuration
- Set RPC node address in scripts
- It is recommended to use private RPC nodes to improve performance

## Notes

- ⚠️ Please keep private key files secure
- 🔒 It is recommended to use an independent trading wallet
- 💡 It is recommended to use private RPC nodes
- 📊 Pay attention to slippage settings to control risks

## Technical Support

- If you encounter any issues, please submit an issue
- Contributions to improve the code are welcome via pull requests
- Community Group: [Buff Community](https://t.me/chainbuff)
- Community Group: [Utopia Community](https://t.me/xiaojiucaiPC)

## Disclaimer

This project is for learning and research purposes only. Any operations using this project that cause losses are not related to the author. Please ensure you fully understand the relevant risks before using this project.
