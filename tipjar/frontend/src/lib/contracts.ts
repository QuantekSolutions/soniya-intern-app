
export const TIPJAR_ADDRESS =
  "0x6252d560A25F0ED120932932476C7216aBe757Ae" as const;

export const TIPJAR_ABI = [
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
  {
    type: "function",
    name: "getTipCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "tip",
    stateMutability: "payable",
    inputs: [{ name: "message", type: "string" }],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
] as const;
