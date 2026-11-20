# TipJar dApp – Setup & Run Guide

TipJar is a decentralized application (dApp) that allows users to send ETH tips with messages through their connected wallets. It is built using Next.js, RainbowKit, Wagmi, and Viem and interacts with a smart contract deployed on the Ethereum Sepolia testnet.

## Prerequisites

Before running the application, make sure you have:

- Node.js and npm installed.
- MetaMask browser extension installed.
- A Reown (WalletConnect) Project ID.
- An Ethereum Sepolia testnet wallet with test ETH.

## Getting Started

Follow these steps to set up and run the TipJar dApp locally.

### 1. Install Dependencies

Navigate to the frontend directory and install the required project dependencies:

```bash
cd tipjar/frontend
npm install
```

This command installs all the packages listed in `package.json`, including Next.js, Wagmi, Viem, RainbowKit, and TanStack Query.

### 2. Configure Environment Variables

The application uses a Reown Project ID to enable wallet connectivity through RainbowKit.

First, create a local environment file by copying the example file:

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Reown Project ID:

```env
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id
```

You can generate a Project ID from the [Reown Dashboard](https://cloud.reown.com).

**Security Note:** The `.env.local` file contains local configuration and must never be committed to GitHub. The `NEXT_PUBLIC_` prefix makes this variable accessible in the browser, so only use a public Project ID or appropriately restricted public configuration. Never store private keys or wallet secrets in frontend environment variables.

### 3. Start the Development Server

After installing dependencies and configuring the environment variables, start the Next.js development server:

```bash
npm run dev
```

Once the server starts, open the following URL in your browser:

http://localhost:3000

The TipJar application should now be accessible locally.

## Network Configuration

The smart contract is deployed on the Ethereum Sepolia testnet.

- **Network:** Ethereum Sepolia
- **Chain ID:** 11155111
- **Wallet:** MetaMask

Make sure MetaMask is connected to Sepolia before interacting with the application. You will need Sepolia test ETH to send tips and pay transaction gas fees.

## Available Functionality

- Connect and disconnect an Ethereum wallet.
- View the connected wallet address and balance.
- Send ETH tips with custom messages.
- View previously submitted tips.
- Check the smart contract balance.
- Withdraw contract funds through the owner-only functionality.

## Production Build

To verify the application before deployment, run:

```bash
npm run build
```

A successful build confirms that the Next.js application compiles correctly for production.
