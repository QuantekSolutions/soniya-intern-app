
import 'dotenv/config'

import {
  createPublicClient,
  formatEther,
  http,
  parseEther,
} from 'viem'

import { sepolia } from 'viem/chains'

async function main() {
  // Read Infura RPC URL from .env
  const rpcUrl = process.env.RPC_URL

  if (!rpcUrl) {
    console.error('RPC_URL is missing in .env file')
    process.exit(1)
  }

  // Create a public client connected to Sepolia
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl),
  })

  // Get latest block number
  const blockNumber = await publicClient.getBlockNumber()
  console.log('Latest Block Number:', blockNumber.toString())

  // Your public MetaMask wallet address
  const address = '0xD863C035be031540cA04D164B05E6c1C086d6F1D' as `0x${string}`

  // Get wallet balance in Wei
  const balance = await publicClient.getBalance({ address })

  // Convert Wei into ETH
  console.log('Wallet Balance:', formatEther(balance), 'ETH')

  // Convert ETH into Wei
  console.log('0.001 ETH in Wei:', parseEther('0.001').toString())
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
