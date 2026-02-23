# Rootstock Collective DAO Starter Kit

[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/rsksmart/rsk-wagmi-starter-kit/badge)](https://scorecard.dev/viewer/?uri=github.com/rsksmart/rsk-wagmi-starter-kit)
[![CodeQL](https://github.com/rsksmart/rsk-wagmi-starter-kit/workflows/CodeQL/badge.svg)](https://github.com/rsksmart/rsk-wagmi-starter-kit/actions?query=workflow%3ACodeQL)

A sample dApp built on the [Rootstock Collective SDK](https://github.com/rsksmart/collective-sdk). It shows staking RIF for voting power, listing active proposals, and casting votes on Rootstock Testnet. This repo is the reference for the developers-portal guide [Implementing On-Chain Voting with Collective SDK](https://dev.rootstock.io/).

**Network:** Rootstock Testnet (Chain ID: 31). All Collective flows in this kit use Testnet.

---

## Purpose of this kit

- **Sample dApp**: A minimal, runnable app that shows real usage of the Collective SDK (proposals, staking, voting) in a React + Wagmi + RainbowKit stack.
- **Guide companion**: The guide *Implementing On-Chain Voting with Collective SDK* uses this kit as its codebase. The README includes a dedicated **SDK methods and code references (for the guide)** section so the Lead Technical Writer can map each SDK method to the exact file and component (e.g. `stakeRIF` in StakingCard, `castVote` in VoteButton, simulation in `lib/simulation.ts`).
- **Scope:** This kit covers participation only (stake, list proposals, vote). It does not implement claim rewards, vault deposit/withdraw, proposal creation, or a Contract Registry; those can be added in the guide or in a fork.

---

## What’s in this kit

- **Wallet connection**: Wagmi + RainbowKit (from the base [rsk-wagmi-starter-kit](https://github.com/rsksmart/rsk-wagmi-starter-kit)).
- **Collective SDK surface**: One hook (`useCollective`) exposing **proposals** (getProposals, castVote), **staking** (getStakingInfo, approveRIF, stakeRIF, unstakeRIF).
- **DAO UI**: Connect wallet → Stake/withdraw RIF → List active proposals → Vote (with simulation before every write).
- **Contract overrides**: Single source of Collective contract addresses for Testnet in `constants/contracts.ts` (governor, treasury, RIF, stRIF, etc.).
- **Rootstock Editor Mode** styling: Black background (`#000000`), off-white text (`#FAF9F5`), orange (`#FF9100`) for active states and primary actions.
- **Security**: Simulate transactions before sending; explicit handling of “Insufficient VP” and other SDK errors.

---

## Three-layer SDK architecture

The Rootstock Collective SDK is built in three layers. Understanding this helps when wiring the kit and when writing the portal guide.

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

## Project structure (target)

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
│   │   └── contracts.ts          # Collective contract-address overrides (Testnet)
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
│   │   ├── collectiveStub.ts    # Stub until @rsksmart/collective-sdk is on NPM (see Setup)
│   │   └── utils
│   │       └── RootstockTestnet.ts
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

**Collective SDK**: The kit uses a **stub** in **`src/lib/collectiveStub.ts`** so the UI (Connect → Stake → Proposals → Vote) builds and runs; read calls return empty/zero data and write calls throw an explanatory message. **Once the Collective SDK NPM package is published, the starter kit will refer to the NPM package:** install `@rsksmart/collective-sdk` (and its peers `@rsksmart/w3layer`, `@rsksmart/sdk-base`), then in **`hooks/useCollective.ts`** replace `createCollectiveStub()` with `createCollective({ chainId: 31, rpcUrl, contractAddresses })` from the SDK.

### 2. Environment

Copy `.env.example` to `.env` and set:

```shell
VITE_WC_PROJECT_ID='your Reown (WalletConnect) project ID'
```

Get a project ID from the [Reown Dashboard](https://cloud.reown.com/sign-in). No other keys are required for this Collective DAO starter.

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
- Contract addresses are fixed; staking amounts are validated (non-negative integer, uint256). Voting uses `proposalId` and `support` from SDK/UI only. All writes (stake, withdraw, vote) are simulated before send; errors (e.g. Insufficient VP) are handled in the UI.  
- No unsafe HTML, `eval`, or user-controlled URLs in critical paths; wallet/signer from Wagmi only.

### 3. Run

```shell
npm run dev
```

Open the app and connect a wallet on **Rootstock Testnet (Chain ID: 31)**. The Collective flows (staking, proposals, voting) are intended for Testnet only in this kit.

---

## Implemented in this kit

This sample dApp focuses on **participation** (stake RIF, list proposals, cast vote) and uses the Collective SDK as intended for a browser dApp. The table below shows what this kit implements versus what the [Collective SDK](https://github.com/rsksmart/collective-sdk) (npm, once published) supports.

| Capability | Starter kit (this repo) | Collective SDK |
|------------|-------------------------|----------------|
| **Staking** | Yes: `approveRIF`, `stakeRIF`, `unstakeRIF`, `getStakingInfo`; UI in StakingCard; WalletClient from connected wallet | Yes: same APIs; SDK accepts WalletClient (browser or Node) |
| **Proposals (read)** | Yes: `getProposals`; UI in ProposalList | Yes |
| **Voting** | Yes: `castVote`; UI in VoteButton; simulate before write; Insufficient VP handling | Yes: same APIs |
| **Contract overrides** | Yes: `constants/contracts.ts` (governor, treasury, RIF, stRIF, etc.) for Testnet; passed into `createCollective` | Yes: SDK supports contract-address overrides |
| **Wallet / signer** | Yes: Wagmi + RainbowKit; user connects wallet in browser; WalletClient passed to SDK for writes. No `PRIVATE_KEY` in .env | Yes: SDK expects a WalletClient for writes (e.g. from Wagmi in browser, or from a key in Node/scripts) |
| **Claim rewards** | No | Yes: `holdings.claimRewards` |
| **Vault deposit/withdraw** | No | Yes: supported by SDK |
| **Proposal creation** | No | Yes: `createProposal`, `createTreasuryTransferProposal`, etc. |
| **Contract Registry** | No: ABIs are local (`lib/collectiveAbis.ts`, `assets/abis`) | Guide can cover Contract Registry for fetching ABIs |

The starter kit has **staking, listing proposals, and voting** (read + write) with contract overrides and simulation, and passes the user’s WalletClient into the SDK for all writes. It does not implement claim rewards, vault flows, proposal creation, or Contract Registry usage; the guide can add those from the SDK reference.

---

## SDK methods and code references (for the guide)

This section gives the Lead Technical Writer explicit method names, file locations, and flow so the guide *Implementing On-Chain Voting with Collective SDK* can reference the kit accurately.

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

Every write (approve, stake, withdraw, vote) is simulated first so the user does not submit a transaction that would revert. Simulation helpers live in **`src/lib/simulation.ts`** and use Viem `publicClient.simulateContract` with minimal ABIs from **`src/lib/collectiveAbis.ts`**:

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

- **Addresses:** **`src/constants/contracts.ts`** exports `COLLECTIVE_CONTRACT_ADDRESSES` keyed by chain ID `31`, with: `governor`, `treasury`, `backersManager`, `builderRegistry`, `RIF`, `stRIF`, `USDRIF`. Passed to `createCollective({ chainId: 31, rpcUrl, contractAddresses })` when using the real SDK.
- **SDK interface and types:** **`src/lib/collectiveStub.ts`** defines the `CollectiveSDK` interface (proposals/staking methods), `ProposalSummary`, `ProposalsListResult`, `StakingInfo`, `TokenAmount`, and `VoteSupport` (enum 0/1/2). These match the Collective SDK surface the guide should document.

---

## Collective SDK NPM package (TODO)

**TODO:** The Collective SDK is not yet published on npm. This kit currently uses a stub (`src/lib/collectiveStub.ts`) so the UI builds and runs without the real package.

---

## References

- **Collective SDK (source):** [rsksmart/collective-sdk](https://github.com/rsksmart/collective-sdk). Source for contract overrides, CollectiveSDK, proposals/staking/vote APIs. NPM package: see **Collective SDK NPM package (TODO)** above.  
- **Base kit**: [rsksmart/rsk-wagmi-starter-kit](https://github.com/rsksmart/rsk-wagmi-starter-kit). Wagmi, RainbowKit, Rootstock chains.  
- **Rootstock**: [Rootstock](https://rootstock.io/) · [Developers Portal](https://dev.rootstock.io/).

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, scripts, and how to open PRs or report issues.

---

## License

See [LICENSE](./LICENSE) in this repository.
