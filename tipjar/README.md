# Hardhat 3 Project – TipJar & QuantekToken

This project showcases a Hardhat 3 project using the native Node.js test runner (`node:test`) and the `viem` library for Ethereum interactions.

To learn more about Hardhat 3, visit the [Getting Started Guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3).

For feedback, join the [Hardhat 3 Telegram Group](https://hardhat.org/hardhat3-telegram-group) or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new).

## Project Overview

This project includes:

- TipJar smart contract for receiving ETH tips.
- QuantekToken (QTK), an ERC-20 token implemented using OpenZeppelin.
- Hardhat 3 configuration with Sepolia network support.
- Ignition modules for smart contract deployment.
- Solidity unit tests and TypeScript integration tests using `node:test` and `viem`.
- Contract verification on Etherscan.

## Technology Stack

- Solidity
- Hardhat 3
- TypeScript
- Viem
- OpenZeppelin Contracts
- Node.js Test Runner
- Ethereum Sepolia Testnet

## Project Usage

### Install Dependencies

```bash
npm install
```

### Running Tests

Run all tests:

```bash
npx hardhat test
```

Run Solidity tests:

```bash
npx hardhat test solidity
```

Run Node.js tests:

```bash
npx hardhat test nodejs
```

### Build Contracts

```bash
npx hardhat build
```

## Sepolia Network Configuration

This project supports deployment to the Ethereum Sepolia testnet.

- Network: Ethereum Sepolia
- Chain ID: `11155111`

The following configuration variables are required:

- `SEPOLIA_RPC_URL`
- `SEPOLIA_PRIVATE_KEY`
- `ETHERSCAN_API_KEY`

## Hardhat Keystore Setup

This project uses the Hardhat Keystore to securely store deployment credentials and API keys.

Set up the required configuration variables using:

```bash
npx hardhat keystore set SEPOLIA_RPC_URL
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
npx hardhat keystore set ETHERSCAN_API_KEY
```

Enter the corresponding values when prompted.

To check configured keys:

```bash
npx hardhat keystore list
```

**Security Notes:**

- Never share your wallet private key.
- Never commit private keys, API keys, or keystore passwords.
- Keep deployment credentials secure.
- Use a Sepolia test wallet for testnet deployments.

## Smart Contract Deployment

### Deploy TipJar

```bash
npx hardhat ignition deploy ignition/modules/TipJar.ts --network sepolia
```

### Deploy QuantekToken

```bash
npx hardhat ignition deploy ignition/modules/QuantekToken.ts --network sepolia
```

## Sepolia Deployments

Both smart contracts have been successfully deployed and verified on the Ethereum Sepolia testnet.

| Contract           | Address                                      | Verification                                                                                              |
| ------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| TipJar             | `0x6252d560A25F0ED120932932476C7216aBe757Ae` | [View on Etherscan](https://sepolia.etherscan.io/address/0x6252d560A25F0ED120932932476C7216aBe757Ae#code) |
| QuantekToken (QTK) | `0x23661B5A9Fb00564Fd79F454c9da07d31C7B7b29` | [View on Etherscan](https://sepolia.etherscan.io/address/0x23661B5A9Fb00564Fd79F454c9da07d31C7B7b29#code) |

## Contract Verification

Verify TipJar:

```bash
npx hardhat ignition deploy ignition/modules/TipJar.ts --network sepolia --verify
```

Verify QuantekToken:

```bash
npx hardhat ignition deploy ignition/modules/QuantekToken.ts --network sepolia --verify
```

Both contracts have been successfully verified on Etherscan.

## Token Information

**QuantekToken (QTK)**

- Token Name: QuantekToken
- Token Symbol: QTK
- Token Standard: ERC-20
- Initial Supply: 1,000,000 QTK
- Decimals: 18

## License

This project is licensed under the MIT License.
