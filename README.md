# ASB — Anonymous Salary Benchmark

**Confidential salary benchmarking on Zama FHEVM (Sepolia)**

ASB lets individuals and companies compare compensation against market averages **without ever exposing clear-text salaries on-chain**. Salaries are encrypted in the browser, aggregated homomorphically in Solidity, and compared via private decryption — only the submitter learns their result.

Built for the [Zama Developer Program — Builder Track](https://www.zama.org/post/zama-developer-program-mainnet-season-3-composable-privacy-is-the-key).

---

## Table of contents

- [Why ASB exists](#why-asb-exists)
- [Key features](#key-features)
- [Live deployment](#live-deployment)
- [Architecture](#architecture)
- [Privacy model](#privacy-model)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Smart contract](#smart-contract)
- [Running tests](#running-tests)
- [Deploy to Sepolia](#deploy-to-sepolia)
- [User flows](#user-flows)
- [Documentation](#documentation)
- [Security and limitations](#security-and-limitations)
- [Roadmap](#roadmap)
- [License](#license)
- [Author](#author)

---

## Why ASB exists

Traditional salary surveys (Glassdoor, Levels.fyi, internal HR spreadsheets) require trusting a central party with your exact compensation. Even when only averages are published, raw submissions often sit in databases and small samples enable inference attacks.

ASB inverts that model:

1. **Encrypt locally** — salary never leaves the browser in clear text.
2. **Compute on ciphertexts** — the contract sums, divides, and compares using FHE.
3. **Release averages at tier boundaries** — public numbers appear only at 5, 10, 15… participants (k-anonymity).
4. **Private comparisons** — each user decrypts a single bit: above or below the live pool average.

Use cases: individual market positioning, confidential payroll benchmarking for employers, and transparent category averages without doxxing contributors.

---

## Key features

| Feature | Description |
|--------|-------------|
| **Encrypted submission** | `euint64` salaries encrypted via `@zama-fhe/relayer-sdk` before tx broadcast |
| **k-anonymity (k ≥ 5)** | No averages or benchmarks until five participants share a category |
| **Tiered public release** | Snapshots at 5, 10, 15… with KMS-verified `finalizeAverage` |
| **Live private compare** | `FHE.gt(yourSalary, poolAverage)` — user-decryptable only by submitter |
| **Company benchmarking** | Unlimited encrypted employee entries; private above/below market bit |
| **Rich categories** | 35 roles × 55 cities × 6 seniority levels |
| **No backend** | Wallet + relayer + contract only; no salary database |

---

## Live deployment

| Resource | Link |
|----------|------|
| **Network** | Ethereum Sepolia (chain ID `11155111`) |
| **Contract** | [`0xb452901e6C5231e8c15Feda1294143d48574325B`](https://sepolia.etherscan.io/address/0xb452901e6C5231e8c15Feda1294143d48574325B) |
| **Frontend** | Run locally (`npm run web:dev`) or deploy `packages/web` to Vercel |
| **Docs** | `/how-it-works/overview` in the web app |

---

## Architecture

```mermaid
flowchart TB
    subgraph Browser
        UI[Next.js dApp]
        SDK[Zama Relayer SDK]
        UI --> SDK
    end

    subgraph Sepolia
        SC[SalaryFHE.sol]
    end

    subgraph Zama
        CP[FHE Coprocessor]
        KMS[KMS / Relayer]
    end

    SDK -->|encrypted input + proof| SC
    SC <-->|FHE ops| CP
    SDK -->|userDecrypt / publicDecrypt| KMS
    KMS -->|signatures + clear values| SDK
    SDK -->|finalizeAverage proof| SC
```

**Data flow (individual):**

1. User selects category (position, city, seniority) and enters USD salary.
2. Relayer SDK encrypts to `externalEuint64` + input proof.
3. `submitSalary` ingests via `FHE.fromExternal`, homomorphically adds to category sum.
4. After k ≥ 5, live encrypted average is computed; user calls `compareToAverage`.
5. Optional: anyone triggers tier public release (request → decrypt → finalize).

---

## Privacy model

### Stays private

- Exact salary (ciphertext handles only on-chain)
- Personal comparison result (one `ebool`, ACL-granted to submitter)
- Per-employee company salaries (aggregated inside encrypted company bucket)
- Company benchmark outcome (above/below market, decryptable only by company wallet)

### Public on-chain

- Wallet addresses and transaction metadata
- Participant count per category
- Finalized tier snapshot averages (after three-step public decrypt)
- Events: `SalarySubmitted`, `AverageFinalized`, etc.

### Design choices

- **Tier snapshots** at round boundaries (5, 10, 15…) mitigate differential leakage from publishing after every new join.
- **Private comparisons** always use the **live** encrypted pool average, not the published tier snapshot.
- **One submission per wallet** for individuals prevents category skewing.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| FHE contracts | Solidity `^0.8.28`, `@fhevm/solidity@0.11.1`, `ZamaEthereumConfig` |
| Toolchain | Hardhat, `@fhevm/hardhat-plugin@0.4.2`, `@fhevm/mock-utils@0.4.2` |
| Frontend | Next.js 15, React 19, Tailwind CSS 4 |
| Wallet | wagmi, RainbowKit, viem |
| Encryption | `@zama-fhe/relayer-sdk@0.4.1` (pinned) |
| Network | Sepolia testnet |

---

## Repository structure

```
FheSalary/
├── packages/
│   ├── contracts/
│   │   ├── contracts/
│   │   │   ├── SalaryFHE.sol          # Main FHEVM contract
│   │   │   └── lib/Categories.sol     # Category dimensions + k threshold
│   │   ├── test/SalaryFHE.test.ts     # 12 Hardhat + mock FHE tests
│   │   ├── scripts/deploy.ts         # Deploy + ABI sync + .env.local update
│   │   └── deployments/sepolia.json
│   └── web/
│       ├── src/
│       │   ├── app/                   # Next.js routes (/, /app, /company, /how-it-works/*)
│       │   ├── components/            # UI + docs sidebar
│       │   ├── hooks/                 # useSalaryFhe, useCompanyFhe, useFhevmInstance
│       │   └── abi/                   # Generated ABI + deployment metadata
│       └── public/                    # Logo assets
├── .env.example
└── package.json                       # npm workspaces root
```

---

## Prerequisites

- **Node.js** ≥ 18 (20+ recommended)
- **npm** ≥ 9
- A **Sepolia-funded wallet** for deploy and on-chain interactions
- **WalletConnect project ID** (optional; MetaMask works without it)
- **Etherscan API key** (optional; for contract verification)

---

## Quick start

```bash
# 1. Clone and install
git clone <your-repo-url>
cd FheSalary
npm install

# 2. Configure environment (see below)
cp .env.example .env
cp .env.example packages/web/.env.local
# Edit both files with your keys and contract address

# 3. Compile and test contracts
npm run contracts:compile
npm run contracts:test

# 4. Start the frontend
npm run web:dev
```

Open [http://localhost:3000](http://localhost:3000), connect a Sepolia wallet, and navigate to **Launch app**.

---

## Environment variables

### Root `.env` (contracts / deploy)

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | Deploy only | Deployer wallet private key |
| `RPC_URL` | Deploy only | Sepolia RPC endpoint |
| `ETHERSCAN_API_KEY` | Verify only | Etherscan API key for verification |

### `packages/web/.env.local` (frontend)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SALARY_FHE_ADDRESS` | Yes | Deployed `SalaryFHE` address |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | No | Enables WalletConnect in RainbowKit |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | No | Custom Sepolia RPC (defaults to public node) |

The deploy script automatically updates `NEXT_PUBLIC_SALARY_FHE_ADDRESS` in `.env.local` after a successful Sepolia deploy.

---

## Smart contract

**Contract:** `SalaryFHE`  
**Base:** `ZamaEthereumConfig` (FHEVM v0.11)

### Core functions

| Function | Caller | Purpose |
|----------|--------|---------|
| `submitSalary(position, city, seniority, enc, proof)` | Individual | One-time encrypted salary submission |
| `compareToAverage()` | Individual | Homomorphic compare vs live pool; grants user-decryptable `ebool` |
| `requestAverageRelease(categoryId, tier)` | Anyone | Step 1 of public tier release |
| `finalizeAverage(categoryId, tier, clearAvg, proof)` | Anyone | Step 3: verify KMS proof, store clear average |
| `submitCompanySalary(...)` | Company | Add encrypted employee salary to market + company bucket |
| `computeCompanyComparison(...)` | Company | Private above/below market for company average |

### View helpers

`getBucketCount`, `isAverageComputed`, `getClearAverage`, `isTierFinalized`, `getLatestFinalizedTier`, `computeCategoryId`, and handle getters for decryption flows.

### Categories

```solidity
categoryId = keccak256(abi.encode(positionId, cityId, seniorityId))
```

- **35** positions, **55** cities, **6** seniority levels  
- **MIN_PARTICIPANTS = 5** for averages and benchmarks  
- Tier publish only at multiples of 5 (5, 10, 15, …)

---

## Running tests

```bash
npm run contracts:test
```

**12 tests** covering:

- Duplicate submission rejection
- Encrypted average after five participants
- Private above/below comparison (`FHE.gt`)
- Tier-5 and tier-10 public release (full three-step flow)
- Invalid tier rejection (e.g. count = 7)
- Live compare still works after tier publish
- Company pool aggregation and benchmark
- Category ID hash parity with frontend (`viem` keccak256)
- Out-of-range category indices

All tests use `@fhevm/mock-utils` via the Hardhat FHEVM plugin.

---

## Deploy to Sepolia

```bash
# From repo root — ensure .env has PRIVATE_KEY and RPC_URL
npm run deploy:sepolia -w @fhesalary/contracts
```

This will:

1. Deploy `SalaryFHE` to Sepolia
2. Write `packages/contracts/deployments/sepolia.json`
3. Copy ABI to `packages/web/src/abi/SalaryFHE.json`
4. Update `NEXT_PUBLIC_SALARY_FHE_ADDRESS` in `packages/web/.env.local`

### Verify on Etherscan (optional)

```bash
cd packages/contracts
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Seed demo data (optional)

Populates **10 categories × 10 wallets** on Sepolia for Explore / dashboard demos. Wallets are derived deterministically from `PRIVATE_KEY` (indices 0–99); each wallet submits once in its category.

**Requirements:** deployer needs roughly **1.85 Sepolia ETH** (FHE `submitSalary` txs are gas-heavy). Default **8 parallel** submissions (`SEED_CONCURRENCY=8`); increase cautiously if the RPC/relayer rate-limits.

```bash
# From repo root
npm run seed:sepolia -w @fhesalary/contracts
```

The script:

1. Derives 100 child wallets from `.env` `PRIVATE_KEY`
2. Funds each wallet (~0.018 ETH)
3. Encrypts salaries via `@zama-fhe/relayer-sdk/node` and calls `submitSalary`
4. Publishes tier-5 and tier-10 public averages per category
5. Writes `packages/web/src/data/seed-manifest.json` for the frontend

Category labels and salary spreads live in `packages/contracts/scripts/seed-data.ts`. Re-runs skip wallets that already submitted.

---

## User flows

### Individuals (`/app`)

1. Connect wallet (Sepolia).
2. Select position, city, seniority; enter annual USD salary.
3. SDK encrypts locally → `submitSalary` transaction.
4. Track category progress (participants / next tier).
5. After k ≥ 5: **Compare my salary privately** → decrypt above/below bit.
6. Optional: **Publish tier N average** (public three-step flow).

### Companies (`/company`)

1. Connect company wallet.
2. Add employee salaries per category (unlimited entries).
3. After ≥ 5 employees in a category and market average ready: **Benchmark privately**.
4. Decrypt single bit: paying above or at/below market.

---

## Documentation

In-app docs (GitBook-style sidebar):

| Page | Route |
|------|-------|
| Overview | `/how-it-works/overview` |
| Core concepts | `/how-it-works/concepts` |
| Individual flow | `/how-it-works/individual-flow` |
| Public average release | `/how-it-works/public-release` |
| Company flow | `/how-it-works/company-flow` |
| Privacy model | `/how-it-works/privacy` |
| FAQ | `/how-it-works/faq` |

External references:

- [Zama FHEVM docs](https://docs.zama.ai/fhevm)
- [Zama Protocol](https://docs.zama.org/protocol)
- [Relayer SDK](https://docs.zama.ai/protocol/relayer-sdk)

---

## Security and limitations

- **Testnet demo** — Sepolia deployment; not audited for mainnet production use.
- **Wallet linkage** — addresses are public; protocol does not link wallet to clear salary, but on-chain activity is visible.
- **Sparse categories** — low-participant pools stay locked; averages may never unlock for niche combos.
- **Tier snapshots** — public averages are historical cohort snapshots, not real-time leaks.
- **Browser requirements** — FHE WASM needs `Cross-Origin-Opener-Policy: same-origin` (configured in `next.config.ts`). Coinbase Wallet is excluded due to COOP conflict.
- **Relayer dependency** — encryption/decryption requires Zama relayer availability.

Report issues responsibly via GitHub Issues.

---

## Roadmap

- [ ] Category explorer (active pools, almost-there categories)
- [ ] Tier history charts from on-chain events
- [ ] Percentile bands (encrypted range comparison)
- [ ] Mainnet deployment
- [ ] Multi-language UI (EN / TR)

---

## License

MIT — see [LICENSE](LICENSE) if present, or contract SPDX headers (`SalaryFHE.sol`: MIT).

---

## Author

**built by [ex_machinam](https://x.com/ex_machinam)**

---

<p align="center">
  <sub>ASB · Anonymous Salary Benchmark · Powered by Zama FHEVM</sub>
</p>
