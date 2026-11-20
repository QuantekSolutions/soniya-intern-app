// Contract addresses from environment variables
export const TIPJAR_ADDRESS =
  process.env.NEXT_PUBLIC_TIPJAR_ADDRESS as `0x${string}`;

export const QUANTEK_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`;

// TipJar contract ABI
export const TIPJAR_ABI = [
  // Get contract owner
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },

  // Send ETH tip
  {
    type: "function",
    name: "tip",
    stateMutability: "payable",
    inputs: [{ name: "message", type: "string" }],
    outputs: [],
  },

  // Get total number of tips
  {
    type: "function",
    name: "getTipCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },

  // Get individual tip details
  {
    type: "function",
    name: "getTip",
    stateMutability: "view",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "from", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "message", type: "string" },
          { name: "timestamp", type: "uint256" },
        ],
      },
    ],
  },

  // Get current ETH balance of TipJar
  {
    type: "function",
    name: "getBalance",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },

  // Withdraw a specific ETH amount (owner only)
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },

  // TipSent event
  {
    type: "event",
    name: "TipSent",
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "message", type: "string" },
    ],
  },

  // Withdrawn event
  {
    type: "event",
    name: "Withdrawn",
    anonymous: false,
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
  },
] as const;

// QuantekToken ERC20 ABI
export const QUANTEK_TOKEN_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "transferFrom",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;