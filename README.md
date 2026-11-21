# Training & Development Portfolio

A collection of hands-on training assignments and development projects covering **React Native, Mobile Application Development, JavaScript, TypeScript, and Blockchain Development**.

This repository documents practical learning, technical implementations, and project work completed during training.

## 1. Training Overview

### A. React Native & Mobile Application Development

Training focused on understanding mobile application development using React Native and Expo.

**Topics Covered:**

- JavaScript fundamentals, functions, arrays, objects, and ES6 features.
- TypeScript fundamentals and project setup.
- React Native and Expo environment setup.
- JSX, components, props, and reusable components.
- Core React Native components and layouts.
- Flexbox and StyleSheet for UI development.
- React Hooks: `useState` and `useEffect`.
- Event handling and component communication.
- Expo Router and file-based navigation.
- Async operations and API integration fundamentals.
- Mobile application debugging and development workflow.

**Practical Project:** Dhunn – Music Player Application.

### B. Blockchain Development

Training focused on Ethereum blockchain fundamentals, smart contract development, and decentralized application development.

**Topics Covered:**

- Blockchain and Ethereum fundamentals.
- Ethereum accounts, wallets, and transactions.
- Sepolia testnet and test ETH.
- Solidity smart contract development.
- Hardhat project setup and configuration.
- Smart contract compilation and testing.
- Contract deployment and verification.
- ERC-20 token standards.
- Viem and blockchain interaction.
- Wallet connectivity using RainbowKit and Wagmi.
- Smart contract integration with Next.js.
- Transaction handling and blockchain events.
- SIWE (Sign-In with Ethereum).
- Git, GitHub, and collaborative development workflow.

**Practical Project:** TipJar – Ethereum Decentralized Application.

---

## 2. Projects

### Project 1: Dhunn – Music Player Application

<text>**Repository:** [github.com/soniya1610/dhunn](https://github.com/soniya1610/dhunn)</text>

Dhunn is a modern music player application built using React Native and Expo. It allows users to discover music, manage their music library, create playlists, and enjoy a personalized listening experience.

**Key Features:**

- **Music Discovery:** Explore and discover songs.
- **Smart Search:** Search for tracks and browse music categories.
- **Music Player:** Play, pause, skip, and control music playback.
- **Liked Songs:** Save favourite tracks for easy access.
- **Playlist Management:** Create, organize, and manage playlists.
- **Dark & Light Mode:** Switch between application themes.
- **User Profile:** Manage profile information and view listening statistics.
- **Authentication:** Login, signup, and password reset screens.
- **Modern UI:** Premium purple and lavender-inspired interface.

**Tech Stack:**

| Technology | Purpose |
|---|---|
| React Native | Mobile application development |
| Expo | Development and build platform |
| TypeScript | Type-safe development |
| Expo Router | File-based navigation |
| React Context API | Global state management |
| AsyncStorage | Local data persistence |
| Ionicons | Application icons |
| Expo Image Picker | Profile photo selection |

**Repository:** [View Dhunn on GitHub](https://github.com/soniya1610/dhunn)

**Download:** [Download Android APK](https://expo.dev/artifacts/eas/955LdLG11CgGFOoISMUzZNmG11T0sNn2KBUJiIdWHkg.apk)

**Run Locally:**

```bash
git clone https://github.com/soniya1610/dhunn.git
cd dhunn
npm install
npx expo start
```

Follow the Expo CLI instructions to run the application on a compatible device or emulator.

**Screenshots:** See the `screenshots/` directory and the Dhunn repository README.

---

### Project 2: TipJar – Ethereum Decentralized Application

<text>**Directory:** `tipjar/`</text>

TipJar is an Ethereum-based decentralized application (dApp) that allows users to send ETH tips with personal messages through connected wallets. It also supports QTK token management, wallet authentication, and blockchain transaction history.

**Smart Contracts:**

- **TipJar:** Handles ETH tips, recipient transfers, personal messages, contract balance, and owner-only withdrawals.
- **QuantekToken (QTK):** ERC-20 token supporting token transfers and allowance-based operations.

**Frontend Features:**

- Connect Ethereum wallets using RainbowKit.
- View connected wallet address and ETH balance.
- Authenticate wallet ownership using SIWE.
- Send ETH tips with personal messages.
- Select tip recipients.
- View tip history and transaction details.
- View and transfer QTK tokens.
- Approve token spending allowances.
- Execute `transferFrom` operations.
- Check contract balance and perform owner-only withdrawals.

**Tech Stack:**

Solidity · Hardhat · Next.js · React · TypeScript · RainbowKit · Wagmi · Viem · TanStack Query · SIWE · OpenZeppelin

**Network:** Ethereum Sepolia  
**Chain ID:** `11155111`

#### Deployed Smart Contracts

| Contract | Address | Etherscan |
|---|---|---|
| TipJar | `0x6252d560A25F0ED120932932476C7216aBe757Ae` | [View Contract](https://sepolia.etherscan.io/address/0x6252d560A25F0ED120932932476C7216aBe757Ae) |
| QuantekToken (QTK) | `0x23661B5A9Fb00564Fd79F454c9da07d31C7B7b29` | [View Contract](https://sepolia.etherscan.io/address/0x23661B5A9Fb00564Fd79F454c9da07d31C7B7b29) |

#### Live Application

[https://quantek-tipjar.vercel.app/](https://quantek-tipjar.vercel.app/)

#### Run Frontend Locally

```bash
cd tipjar/frontend
npm install
```

Create `.env.local` using `.env.example` and configure:

```env
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id
NEXT_PUBLIC_TIPJAR_ADDRESS=your_tipjar_contract_address
NEXT_PUBLIC_TOKEN_ADDRESS=your_token_contract_address
NEXT_PUBLIC_RPC_URL=your_sepolia_rpc_url
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

#### Smart Contract Setup

```bash
cd tipjar
npm install
npx hardhat compile
npx hardhat test
```

For detailed instructions, see:

- [Smart Contract Documentation](tipjar/README.md)
- [Frontend Documentation](tipjar/frontend/README.md)

---

## 3. Blockchain Training Assignments

The `Blockchain-Training/` directory contains practical blockchain training exercises.

These exercises include:

- Ethereum Sepolia network connection.
- Reading blockchain data.
- Sending ETH transactions.
- Working with wallet accounts and RPC providers.
- Using TypeScript and Viem for blockchain interaction.
- Environment variable configuration and secure credential handling.

The TipJar project extends these fundamentals into a complete decentralized application.

---

## 4. Development Tools

Tools used across training and project development:

- Visual Studio Code
- Node.js and npm
- React Native and Expo
- TypeScript
- Android Studio
- Git and GitHub
- Hardhat
- MetaMask
- Sepolia Etherscan
- Reown Dashboard
- Alchemy
- Vercel

## 5. Key Learning Outcomes

- Developed practical understanding of React Native and mobile application development.
- Built a music player application using Expo and React Native.
- Applied reusable components, hooks, navigation, and state management.
- Learned Solidity smart contract development and testing.
- Deployed and verified smart contracts on Ethereum Sepolia.
- Integrated Ethereum wallets with a Next.js frontend.
- Implemented ETH transfers and ERC-20 token operations.
- Explored wallet-based authentication using SIWE.
- Practiced Git branching, commits, pushes, and pull requests.
- Deployed a decentralized application using Vercel.

## 6. Security Practices

- Never commit `.env.local` or private credentials.
- Never expose wallet private keys or secret recovery phrases.
- Use testnet ETH for development and testing.
- Restrict RPC API keys appropriately.
- Keep sensitive configuration outside publicly accessible frontend code.

---

**Purpose:** This repository documents practical training assignments, technical learning, and project implementations in Mobile Application Development and Blockchain Technology.
