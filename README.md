# Rootstock Collective DAO Starter Kit

[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/rsksmart/rsk-wagmi-starter-kit/badge)](https://scorecard.dev/viewer/?uri=github.com/rsksmart/rsk-wagmi-starter-kit)
[![CodeQL](https://github.com/rsksmart/rsk-wagmi-starter-kit/workflows/CodeQL/badge.svg)](https://github.com/rsksmart/rsk-wagmi-starter-kit/actions?query=workflow%3ACodeQL)

A sample dApp built on the [Rootstock Collective SDK](https://github.com/rsksmart/collective-sdk). It shows staking RIF for voting power, listing active proposals, and casting votes on Rootstock. This repo is the reference for the developers-portal guide [Implementing On-Chain Voting with Collective SDK](https://dev.rootstock.io/).

**Networks:** Rootstock Mainnet (Chain ID: 30) and Testnet (Chain ID: 31). The app uses the connected wallet’s chain; proposals and staking work on either network.

---

## Purpose of this kit

- **Sample dApp**: A minimal, runnable app that shows usage of the Collective SDK (proposals, staking, voting) in a React + Wagmi + RainbowKit stack.
- **Guide companion**: The guide *Implementing On-Chain Voting with Collective SDK* uses this kit. The **SDK methods and code references** section maps methods to files (e.g. `stakeRIF` in StakingCard, `castVote` in VoteButton, simulation in `lib/simulation.ts`).
- **Scope:** This kit covers participation only (stake, list proposals, vote). It does not implement claim rewards, vault deposit/withdraw, proposal creation, or a Contract Registry; those can be added in the guide or in a fork.
---

## What’s in this kit

- **Wallet connection**: Wagmi + RainbowKit (from [rsk-wagmi-starter-kit](https://github.com/rsksmart/rsk-wagmi-starter-kit)). Custom account modal for small tRBTC display.
- **Collective SDK surface**: One hook (`useCollective`) exposing **proposals** (getProposals, castVote), **staking** (getStakingInfo, approveRIF, stakeRIF, unstakeRIF).
- **DAO UI**: Connect wallet → Stake/withdraw RIF → List active proposals → Vote (with simulation before every write).
- **Contract overrides**: Collective contract addresses for Mainnet and Testnet in `constants/contracts.ts` (governor, treasury, RIF, stRIF, etc.). Replace Mainnet placeholders when the Collective is deployed on Mainnet.
- **Rootstock Editor Mode** styling: Black background (`#000000`), off-white text (`#FAF9F5`), orange (`#FF9100`) for active states and primary actions.
- **Security**: Simulate transactions before sending; simulation failures (e.g. insufficient balance, revert) are caught and shown as clear messages. Explicit handling of “Insufficient VP” and other SDK errors in the UI.

---

## Three-layer SDK architecture

The Rootstock Collective SDK has three layers.

```
┌─────────────────────────────────────────────────────────────────┐
│  Module layer (e.g. Collective SDK)                              │
│  proposals, staking, vote (domain APIs)                          │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Base layer (@rskSmart/sdk-base)                                 │
│  Shared logic, errors (e.g. Insufficient VP), types              │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  W3 / Transport layer (@rskSmart/w3layer)                        │
│  Web3CoreLayer: wraps a chain client (e.g. Viem PublicClient)   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                         Viem · Wagmi · Chain (Rootstock Testnet)
```

1. **W3Layer (Transport)**  
   - **Role**: Connects the SDK to the blockchain.  
   - **In this kit**: With the stub, the flow is conceptual. When using the published NPM package, implemented via **Web3CoreLayer** from `@rskSmart/w3layer`, initialized with a Viem **PublicClient** (and optionally wallet client for writes) for Rootstock Testnet.  
   - **You provide**: RPC URL, chain config, and (for writes) account/signer.

2. **Base (Shared logic)**  
   - **Role**: Common utilities, error types (e.g. “Insufficient VP”), and base types used by all modules.  
   - **In this kit**: Used implicitly by the Collective SDK; we handle **Insufficient VP** and other base errors in the UI and in a central error handler.

3. **Module (Collective)**  
   - **Role:** Domain APIs for the Collective DAO (proposals, staking, voting).  
   - **In this kit**: With the stub, types and usage match the SDK surface. When using the NPM package, **CollectiveSDK** from `@rskSmart/collective-sdk`, created with the core layer and **contract-address overrides** for Testnet. The app uses only the **proposals**, **staking**, and **vote** suites returned by `useCollective`.

**Data flow (conceptual)**  
Wallet (RainbowKit) → Wagmi → Viem client → Web3CoreLayer → CollectiveSDK → `proposals` / `staking` / `vote` → React UI.

---

## Project structure

The layout will look like this:

```text
.
├── public
│   └── favicon.svg               # App icon (Rootstock Editor orange)
├── src
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── config
│   │   ├── providers.tsx
│   │   ├── rainbowkitConfig.ts
│   │   └── wagmiProviderConfig.ts
│   ├── constants
│   │   └── contracts.ts          # Collective contract-address overrides (Mainnet and Testnet)
│   ├── hooks
│   │   └── useCollective.ts      # Web3CoreLayer + CollectiveSDK; returns proposals, staking, vote
│   ├── components
│   │   ├── dao/                  # DAO UI: ConnectWallet, StakingCard, ProposalList, VoteButton
│   │   │   ├── ConnectWallet.tsx
│   │   │   ├── StakingCard.tsx
│   │   │   ├── ProposalList.tsx
│   │   │   └── VoteButton.tsx
│   │   └── ui/                   # Shadcn etc.
│   ├── lib
│   │   ├── collectiveStub.ts    # Fallback when SDK unavailable
│   │   └── utils
│   │       └── RootstockChains.ts   # Mainnet (30) and Testnet (31); RPC and chain config
│   └── pages
├── README.md                     # This file
└── package.json
```

- **`constants/contracts.ts`**: Single source of Collective contract addresses for Rootstock Testnet (ID: 31), using the SDK’s **contract-addresses-override** pattern.  
- **`hooks/useCollective.ts`**: Builds Viem client → Web3CoreLayer → CollectiveSDK; returns `proposals`, `staking`, `vote`.  
- **UI**: ConnectWallet (Wagmi/RainbowKit), StakingCard (staking/withdraw RIF), ProposalList (active proposals), VoteButton (simulate then vote).

---

## Prerequisites

- Node.js 18+
- A Reown (WalletConnect) project ID for the dApp
- Wallet that supports Rootstock Testnet (e.g. MetaMask)

---

## Setup

### 1. Clone and install

```shell
git clone https://github.com/rsksmart/collective-starter-kit.git
cd collective-starter-kit
npm install
```

### 2. Environment

Copy `.env.example` to `.env` and set the variables below.

#### Get your WalletConnect (Reown) project ID (required)

Required for WalletConnect (e.g. mobile wallets).

1. Go to the [Reown (WalletConnect) Cloud](https://cloud.reown.com) and sign in (or create an account).
2. Open **Projects** and click **Create** (or use an existing project).
3. Open the project and copy the **Project ID** from the project details.
4. In your `.env` file set:
   ```shell
   VITE_WC_PROJECT_ID='your-project-id'
   ```

#### Get your Rootstock RPC API key (optional)

With an API key, the app uses the [Rootstock RPC API](https://dev.rootstock.io/developers/rpc-api/rootstock) (`https://rpc.testnet.rootstock.io/<your-api-key>`) for higher rate limits. Without it, the app uses the public Testnet node.

1. Go to the [Rootstock RPC API dashboard](https://dashboard.rpc.rootstock.io) and sign up or log in.
2. Click **New API key**, give it a name, and select **Testnet**.
3. Create the key, then copy it from the dashboard.
4. In your `.env` file set:
   ```shell
   VITE_ROOTSTOCK_RPC_API_KEY='your-api-key'
   ```
   Leave this empty or omit it to use the public node. See [Getting Started with the Rootstock RPC API](https://dev.rootstock.io/developers/rpc-api/rootstock/setup) for more.

Only these two variables are used. No other keys are required for the Collective DAO flows.

**How the starter kit uses the Collective SDK for writes**  
The Collective SDK’s write methods (`stakeRIF`, `unstakeRIF`, `castVote`, etc.) take a **WalletClient** (from viem) so the SDK can request a signature. In this starter kit we use the SDK correctly as a **browser dApp**: the WalletClient comes from the **user’s connected wallet** (Wagmi + RainbowKit). The user approves each transaction in their wallet; the app never has access to a private key. No `PRIVATE_KEY` is required in `.env`; only `VITE_WC_PROJECT_ID` for WalletConnect.

**What the user needs to perform write actions (stake, unstake, vote)**  
The **connected wallet** must hold Testnet funds: **tRBTC** for gas, and **RIF** (for staking) or **stRIF** (for voting / unstaking). The kit passes the wallet’s WalletClient into the SDK; the SDK then requests the signature from the user’s wallet.

**Security and environment**  
- No signing secrets: The app never has access to a private key; all writes are signed by the user’s connected wallet (Wagmi). No `PRIVATE_KEY` in env.  
- All `VITE_*` vars are bundled into the client; do not put secrets in them. Only `VITE_WC_PROJECT_ID` is required (public by design).  
- `.env` and `.env.local` are in `.gitignore`; use `.env.example` as a template.  
- CI runs `npm audit --audit-level=high`. See [SECURITY.MD](./SECURITY.MD) for reporting.

**Contracts and dApp security**  
- This repo has no smart contract source. It calls external Rootstock Collective DAO contracts on Testnet via `constants/contracts.ts`. Contract security is the responsibility of the Collective SDK and Rootstock.  
- Contract addresses are fixed; staking amounts are validated in the UI as a positive integer in wei (minimum 1 wei, maximum uint256 — at most 78 decimal digits). The Collective contracts or SDK may enforce additional limits; simulation before send will fail if the amount is invalid on-chain. Voting uses `proposalId` and `support` from SDK/UI only. All writes (stake, withdraw, vote) are simulated before send; errors (e.g. Insufficient VP) are handled in the UI.  
- No unsafe HTML, `eval`, or user-controlled URLs in critical paths; wallet/signer from Wagmi only.

### 3. Run

```shell
npm run dev
```

Open the app and connect a wallet on **Rootstock Mainnet (Chain ID: 30) or Testnet (Chain ID: 31)**. Staking, proposals, and voting work on either network.

---

## Implemented in this kit

This sample dApp focuses on **participation** (stake RIF, list proposals, cast vote) and uses the Collective SDK as intended for a browser dApp. The table below shows what this kit implements versus what the [Collective SDK](https://github.com/rsksmart/collective-sdk) supports.

| Capability | Starter kit (this repo) | Collective SDK |
|------------|-------------------------|----------------|
| **Staking** | Yes: `approveRIF`, `stakeRIF`, `unstakeRIF`, `getStakingInfo`; UI in StakingCard; WalletClient from connected wallet | Yes: same APIs; SDK accepts WalletClient (browser or Node) |
| **Proposals (read)** | Yes: `getProposals`; UI in ProposalList | Yes |
| **Voting** | Yes: `castVote`; UI in VoteButton; simulate before write; Insufficient VP handling | Yes: same APIs |
| **Contract overrides** | Yes: `constants/contracts.ts` (governor, treasury, RIF, stRIF, etc.) for Mainnet and Testnet; passed into SDK | Yes: SDK supports contract-address overrides |
| **Wallet / signer** | Yes: Wagmi + RainbowKit; user connects wallet in browser; WalletClient passed to SDK for writes. No `PRIVATE_KEY` in .env | Yes: SDK expects a WalletClient for writes (e.g. from Wagmi in browser, or from a key in Node/scripts) |
| **Claim rewards** | No | Yes: `holdings.claimRewards` |
| **Vault deposit/withdraw** | No | Yes: supported by SDK |
| **Proposal creation** | No | Yes: `createProposal`, `createTreasuryTransferProposal`, etc. |
| **Contract Registry** | No: ABIs are local (`lib/collectiveAbis.ts`, `assets/abis`) | Guide can cover Contract Registry for fetching ABIs |

The starter kit has **staking, listing proposals, and voting** (read + write) with contract overrides and simulation, and passes the user’s WalletClient into the SDK for all writes. It does not implement claim rewards, vault flows, proposal creation, or Contract Registry usage; the guide can add those from the SDK reference.

---

## SDK methods and code references (for the guide)

Method names and file locations for the guide.

### Explaining voting when the kit doesn’t create proposals

Proposals are what get voted on; this starter kit does **not** implement proposal creation. The writer can still explain on-chain voting clearly by framing the guide as follows:

1. **Where proposals come from**  
   Proposals exist on-chain (Rootstock Testnet) and are created **outside** this dApp—e.g. by governance admins, a separate proposal-creation tool, or the Collective SDK/contracts used elsewhere. The guide should state this upfront: *“This tutorial focuses on **participating** in governance: staking RIF for voting power and voting on **existing** proposals. Proposal creation is documented separately (or in the SDK reference).”*

2. **What this kit demonstrates**  
   The kit is the reference for the **participation** path: connect wallet → stake RIF → list proposals (`getProposals`) → cast vote (`castVote`). The writer can walk through that flow and map each step to the SDK methods and files in the tables below. Voting is explained as: *“When proposals are active, users with stRIF (voting power) can call `castVote(proposalId, support)`; the starter kit does this in VoteButton after simulating the transaction.”*

3. **Hands-on and “No proposals yet”**  
   If a reader runs the kit and sees “No proposals yet,” the guide can note that Testnet may have no active proposals yet, or point them to a separate section/tool for creating a test proposal so they can then use the kit to vote. The kit’s empty state already says: *“This kit supports viewing and voting only; create proposals elsewhere on Rootstock Testnet.”*

4. **Optional: separate “Proposal creation” section**  
   The guide can add a section (or link to SDK docs) that covers how to **create** proposals (e.g. via the Collective SDK or contracts), without requiring the starter kit to implement it. That keeps the kit focused on participation while the narrative still covers the full lifecycle: create (elsewhere) → vote (this kit).

### SDK methods used in this kit

| SDK method | Where used | Purpose |
|------------|------------|--------|
| `sdk.proposals.getProposals({ limit?, offset? })` | `src/components/dao/ProposalList.tsx` | Fetches active proposals; called with `{ limit: 20 }`. Returns `{ totalCount, proposals: ProposalSummary[] }`. |
| `sdk.proposals.castVote(walletClient, proposalId, support)` | `src/components/dao/VoteButton.tsx` | Casts vote on a proposal. `support` is `VoteSupport` (0 Against, 1 For, 2 Abstain). Simulation runs first via `lib/simulation.ts`. |
| `sdk.staking.getStakingInfo(userAddress)` | `src/components/dao/StakingCard.tsx` | Returns RIF/stRIF balances, allowance, and `hasAllowance(amount)`. Used to decide if `approveRIF` is needed before stake. |
| `sdk.staking.approveRIF(walletClient, amount)` | `src/components/dao/StakingCard.tsx` | ERC20 approve for stRIF; called only when `!hasAllowance(value)` before stake. Simulation: `simulateApproveRIF` in `lib/simulation.ts`. |
| `sdk.staking.stakeRIF(walletClient, amount, delegatee)` | `src/components/dao/StakingCard.tsx` | Stakes RIF; `delegatee` is the user's address. Simulation: `simulateStakeRIF` before write. |
| `sdk.staking.unstakeRIF(walletClient, amount, recipient)` | `src/components/dao/StakingCard.tsx` | Withdraws stRIF; `recipient` is the user's address. Simulation: `simulateUnstakeRIF` before write. |

All write methods take a **WalletClient** (from Wagmi `useWalletClient()`). The kit obtains it in `src/hooks/useCollective.ts` and passes it into the DAO components together with `sdk` and `address`.

### Simulation before write

Every write is simulated first. Helpers in **`src/lib/simulation.ts`** use Viem `simulateContract` and **`src/lib/collectiveAbis.ts`**. Failures throw with a clear message for the UI.

| Simulation function | Used before | Contract / function simulated |
|---------------------|-------------|------------------------------|
| `simulateApproveRIF` | `approveRIF` | RIF `approve(stRIF, amount)` |
| `simulateStakeRIF` | `stakeRIF` | stRIF `depositAndDelegate(delegatee, amount)` |
| `simulateUnstakeRIF` | `unstakeRIF` | stRIF `withdrawTo(recipient, amount)` |
| `simulateCastVote` | `castVote` | Governor `castVote(proposalId, support)` |

### User flow to SDK

1. **Connect wallet** – Wagmi + RainbowKit; `useCollective()` returns `sdk`, `walletClient`, `address` when chain is Rootstock Testnet (31).
2. **Stake RIF** – StakingCard: `getStakingInfo` then, if needed, `approveRIF` (after simulate), then `stakeRIF` (after simulate). Amount is wei (integer); validated in UI.
3. **List proposals** – ProposalList: `getProposals({ limit: 20 })`; each proposal has `proposalId`, `state`, `stateLabel`, `deadline`, `forVotes`, `againstVotes`, `abstainVotes`.
4. **Vote** – VoteButton: `simulateCastVote` then `castVote(walletClient, proposalId, support)`; errors (e.g. Insufficient VP) handled via `src/lib/errors.ts`.

### Contract overrides and types

- **Addresses:** **`src/constants/contracts.ts`** exports `COLLECTIVE_CONTRACT_ADDRESSES` keyed by chain ID `31`, with: `governor`, `treasury`, `backersManager`, `builderRegistry`, `RIF`, `stRIF`, `USDRIF`. Passed to `createCollective({ chainId: 31, rpcUrl, contractAddresses })` when using the SDK.
- **SDK interface and types:** **`src/lib/collectiveStub.ts`** defines the `CollectiveSDK` interface (proposals/staking methods), `ProposalSummary`, `ProposalsListResult`, `StakingInfo`, `TokenAmount`, and `VoteSupport` (enum 0/1/2). These match the Collective SDK surface the guide should document.

---

## Collective SDK

This kit depends on **`@rsksmart/collective-sdk`** for proposals, staking, and voting on Rootstock Testnet. Install with `npm install`.

---

## References

- **Collective SDK (source):** [rsksmart/collective-sdk](https://github.com/rsksmart/collective-sdk). Contract overrides, CollectiveSDK, proposals/staking/vote APIs.  
- **Base kit**: [rsksmart/rsk-wagmi-starter-kit](https://github.com/rsksmart/rsk-wagmi-starter-kit). Wagmi, RainbowKit, Rootstock chains.  
- **Rootstock**: [Rootstock](https://rootstock.io/) · [Developers Portal](https://dev.rootstock.io/).

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, scripts, and how to open PRs or report issues.

---

## License

See [LICENSE](./LICENSE) in this repository.
