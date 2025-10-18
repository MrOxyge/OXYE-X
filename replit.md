# Discord LTC Payment Bot

## Overview

This is a Discord bot that handles real Litecoin (LTC) cryptocurrency payments. The bot implements payment commands, balance checking, and transaction features using Discord.js v14 with dot prefix commands. All transactions are real and irreversible on the Litecoin mainnet.

**Status**: ✅ Bot is online and fully functional as a payment-only bot

## Core Features

### Payment System
- **Real LTC Payments**: Actual Litecoin transactions on mainnet
- **USD Amount Input**: Send payments by USD value (`.p 1` = $1 worth of LTC)
- **Address Validation**: Validates LTC addresses before sending
- **Transaction Confirmation**: Real blockchain confirmations

### Wallet Integration
- **Read-Only Mode**: Connect any LTC address safely for balance monitoring
- **Private Key Mode**: Full transaction capabilities with private key
- **Multiple Address Formats**: Supports Legacy (L...), SegWit (M...), and Bech32 (ltc1...)

### Commands
- `.p <amount>` - Send USD worth of LTC payments
- `.b` - Check real LTC wallet balance with USD conversion
- `.connect <address>` - Connect wallet in read-only mode
- `.status` - Check bot and wallet status
- `.chart` - View balance charts
- `.help` - Display bot information and command usage

### Access Control
- **Public Access**: Anyone can use the bot after invitation to server
- **Rate Limiting**: 10-second cooldown between commands (owner bypassed)
- **Admin Permissions**: Full Discord access for maximum compatibility

### Validation Layer (`utils/ltcValidator.js`)
- Validates multiple LTC address formats:
  - Legacy addresses (L...)
  - SegWit addresses (M...)
  - Bech32 addresses (ltc1...)
- Implements Base58 and Bech32 character validation

### Real LTC Transaction Engine (`utils/realLTC.js`)
- Handles actual Litecoin blockchain transactions using bitcoinjs-lib
- Integrates with BlockCypher API for UTXO management and broadcasting
- Creates and signs real transactions with proper fee calculation
- Supports mainnet LTC payments with full blockchain validation

### Data Storage (`utils/database.js`)
- File-based JSON storage for balances and transactions
- Automatic file creation and directory management
- CRUD operations for user balances and transaction history
- Error handling for file system operations

## Payment Flow

1. **User Interaction**: User executes payment command (`.p <amount>`)
2. **Command Processing**: Bot validates command and USD amount
3. **Address Collection**: Bot prompts for recipient LTC address
4. **Address Validation**: LTC address format validation
5. **Real Transaction**: Create and broadcast actual LTC transaction
6. **Confirmation**: Real blockchain confirmation tracking
7. **Response**: Send formatted response with transaction details

## External Dependencies

### Core Dependencies
- **discord.js v14.21.0**: Discord API wrapper and bot framework
- **bitcoinjs-lib**: Transaction creation, signing, and validation
- **@bitcoinerlab/secp256k1**: Cryptographic library for signing
- **ecpair**: Key pair management for Bitcoin/Litecoin
- **coinselect**: UTXO selection for optimal transactions

### External APIs and Services
- **BlockCypher API**: Blockchain data, UTXO management, and transaction broadcasting
- **Litecoin Mainnet**: Real cryptocurrency network
- **CoinGecko API**: Real-time LTC price data

## Setup Requirements

### Environment Variables (Secrets)
- `DISCORD_TOKEN`: Discord bot token
- `LTC_PRIVATE_KEY`: (Optional) Private key for sending transactions
- `LTC_ADDRESS`: (Optional) Read-only wallet address
- `BLOCKCYPHER_TOKEN`: (Optional) API token for higher limits
- `OWNER_USER_ID`: (Optional) Discord user ID for owner privileges

### Bot Permissions
- Send Messages
- Use Slash Commands
- Read Message History
- Add Reactions

## Security Notes

- All transactions are irreversible on the Litecoin mainnet
- Private keys should be stored securely in Replit Secrets
- Read-only mode is recommended for general users
- Owner should have full access control via OWNER_USER_ID

## Bot Invite Links

- **Admin Permissions**: `https://discord.com/api/oauth2/authorize?client_id=BOT_ID&permissions=8&scope=bot`
- **Basic Permissions**: `https://discord.com/api/oauth2/authorize?client_id=BOT_ID&permissions=274878221312&scope=bot`
- **With Slash Commands**: `https://discord.com/api/oauth2/authorize?client_id=BOT_ID&permissions=8&scope=bot%20applications.commands`

The bot can be invited to any Discord server and will work immediately upon invitation.