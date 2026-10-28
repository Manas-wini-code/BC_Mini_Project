# Blockchain-Based Supply Chain Tracking System

A decentralized, tamper-proof supply chain tracking web application built with **React**, **Vite**, **Ethers.js v6**, and an **Ethereum Solidity Smart Contract**.

---

## 📋 Project Overview

This system tracks products throughout their lifecycle using an Ethereum smart contract with Role-Based Access Control (RBAC). It eliminates centralized databases, storing all product identities, ownership records, and movement history directly on the blockchain.

### Key Capabilities:
- **Role-Based Access Control (RBAC)**: Admin assigns verified roles (`Manufacturer`, `Distributor`, `Warehouse`, `Retailer`).
- **Cryptographic Product Registration**: Only authorized Manufacturers can mint and register product batches.
- **Custody Transfer**: Current owners transfer digital and physical custody along with real-time location checkpoints.
- **Proof of Delivery**: Final destination delivery confirmation by authorized retailers/warehouses.
- **Public Read-Only Tracking**: Anyone (consumers, auditors) can enter a Product ID to inspect the full chronological movement timeline with QR codes—no wallet or gas required!

### Deployed Contract Details
- **Network**: Ethereum Sepolia Testnet
- **Chain ID**: 11155111
- **Contract Address**: [`0x4e7590c7e068c603fce08700380dca01b83802d9`](https://sepolia.etherscan.io/address/0x4e7590c7e068c603fce08700380dca01b83802d9)
- **Sepolia Explorer**: [https://sepolia.etherscan.io/address/0x4e7590c7e068c603fce08700380dca01b83802d9](https://sepolia.etherscan.io/address/0x4e7590c7e068c603fce08700380dca01b83802d9)

---

## 🛠 Technology Stack

- **Frontend**: React 19, Vite
- **Styling**: Vanilla CSS (Navy `#0f172a` and Teal `#0d9488` logistics theme)
- **Blockchain**: Ethereum / EVM-compatible (Sepolia Testnet, Localhost / Ganache / Remix VM)
- **Smart Contract**: Solidity `^0.8.20`
- **Deployment**: Remix IDE
- **Web3 Interaction**: Ethers.js v6
- **QR Codes**: `qrcode.react`
- **Icons**: `lucide-react`

---

## 📁 Project Structure

```
blockchain-supply-chain/
├── contracts/
│   ├── SupplyChain.sol           # Solidity Smart Contract
│   └── build/
│       ├── contracts_SupplyChain_sol_SupplyChain.abi
│       └── contracts_SupplyChain_sol_SupplyChain.bin
├── frontend/
│   ├── src/
│   │   ├── blockchain/
│   │   │   ├── config.js         # Contract address & network configs
│   │   │   ├── contract.js       # Ethers.js v6 interaction service
│   │   │   └── contractABI.json  # Compiled Contract ABI
│   │   ├── components/
│   │   │   ├── ContractModal.jsx # In-app Contract Address settings
│   │   │   ├── HistoryTimeline.jsx # Movement history timeline
│   │   │   ├── Navbar.jsx        # Navigation & Wallet status
│   │   │   ├── ProductCard.jsx   # Product summary with QR code
│   │   │   └── StatusBadge.jsx   # Lifecycle status indicators
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── ManufacturerDashboard.jsx
│   │   │   ├── TrackProduct.jsx
│   │   │   └── TransferProduct.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## 🚀 Step-by-Step Setup & Deployment Guide

### STEP 1: Deploy Smart Contract in Remix IDE

1. Open [Remix IDE](https://remix.ethereum.org/) in your web browser.
2. In the File Explorer tab, create a new file named `SupplyChain.sol` inside the `contracts/` directory.
3. Copy and paste the complete content of [`contracts/SupplyChain.sol`](./contracts/SupplyChain.sol).
4. Click on the **Solidity Compiler** tab (left sidebar):
   - Compiler version: `0.8.20` (or `0.8.28`)
   - Click **Compile SupplyChain.sol** (green checkmark will appear).
5. Click on the **Deploy & Run Transactions** tab:
   - **Environment**:
     - For quick demo: Choose **Remix VM (Cancun)** or **Injected Provider - MetaMask** (Sepolia Testnet).
   - **Contract**: Select `SupplyChain - contracts/SupplyChain.sol`.
   - Click **Deploy**.
6. Under **Deployed Contracts**, copy the deployed contract address (e.g. `0x123...456`).

---

### STEP 2: Configure Contract in Frontend

You have two easy ways to set the contract address:

#### Option A: In the Web Application (No code editing needed)
1. Launch the web app (`npm run dev`).
2. Click **"Set Contract Address"** in the top warning banner or **"Contract Config"** in the navigation bar.
3. Paste the deployed address and click **Save Contract Address**.

#### Option B: In the Configuration File
Open [`frontend/src/blockchain/config.js`](./frontend/src/blockchain/config.js) and update:
```javascript
export const DEFAULT_CONTRACT_ADDRESS = "0xYourDeployedAddressHere";
```

*(Note: The ABI is already pre-compiled and saved inside `frontend/src/blockchain/contractABI.json`)*.

---

### STEP 3: Run the Frontend Locally

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser at `http://localhost:5173/`.

---

## 🦊 MetaMask Configuration

1. Install the [MetaMask extension](https://metamask.io/) in Chrome/Brave/Edge.
2. Ensure you have test ETH:
   - If using **Sepolia Testnet**: Obtain free test ETH from faucets like [Google Cloud Web3 Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) or [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/).
   - If using **Remix VM / Localhost**: You can use test accounts pre-funded in Remix.
3. Click **Connect MetaMask** in the navbar to connect your wallet.

---

## 🎬 College Project Demonstration Workflow

Follow this 5-minute live demonstration flow during your project viva/presentation:

| Step | Action | Page | Expected Result |
|---|---|---|---|
| **1** | Connect Admin Wallet | Top Navbar | Shows connected address with `Admin` badge. |
| **2** | Assign Role to Manufacturer | Admin Dashboard | Enter a second wallet address, select **Manufacturer**, click *Assign Role*. Wait 2-3 sec for tx receipt. |
| **3** | Assign Role to Distributor / Retailer | Admin Dashboard | Assign **Distributor** and **Retailer** roles to other sample addresses. |
| **4** | Query Role | Admin Dashboard | Enter any address in "Check Wallet Role" to verify its on-chain role without gas. |
| **5** | Register a Product | Manufacturer Dashboard | Switch wallet to Manufacturer. Enter Name (*"Paracetamol 500mg"*), Company (*"Apex BioPharma"*), Batch (*"LOT-2026-X01"*). Click *Register Product*. Shows generated Product ID (e.g. `#1`) and Tx Hash. |
| **6** | Transfer Ownership | Transfer & Custody | Enter Product ID `1`, Recipient address (Distributor), and Location (*"Central Logistics Hub, Bay 3"*). Click *Submit Custody Transfer*. Status updates to `InTransit`. |
| **7** | Mark Delivered | Transfer & Custody (Deliver tab) | Enter Product ID `1` and Destination (*"City Pharmacy Retail Store #102"*). Click *Mark as Delivered*. |
| **8** | Public Read-Only Audit | Track Product | Enter Product ID `1`. Click *Track Product*. Inspect the vertical timeline showing previous owners, new owners, transit locations, timestamps, and the generated QR code! |

---

## 🧪 Testing Checklist

- [x] Contract compiles with zero errors on Solidity 0.8.20+.
- [x] Only Admin can assign/revoke roles (`onlyAdmin` modifier tested).
- [x] Only Manufacturer can register products (`onlyRole` modifier tested).
- [x] Only current product owner can transfer custody (`onlyProductOwner` modifier tested).
- [x] Delivered products cannot be transferred again.
- [x] Ethers.js v6 methods used correctly (`BrowserProvider`, `JsonRpcProvider`, `Contract`).
- [x] MetaMask connection, account change, and chain change events handled.
- [x] Responsive layout with clean navy/teal logistics styling.
- [x] Public read-only tracking page functions even when wallet is disconnected.
