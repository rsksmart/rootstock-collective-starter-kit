# Contributing to Rootstock Collective DAO Starter Kit

Thank you for your interest in contributing. This document gives a short overview of how to work with the repo.

## Prerequisites

- **Node.js** 18+ (see [.nvmrc](.nvmrc) or `engines` in [package.json](package.json))
- **WalletConnect project ID** for local dev (copy [.env.example](.env.example) to `.env` and set `VITE_WC_PROJECT_ID`)

## Development setup

```bash
git clone <repo-url>
cd collective-starter-kit   # or your clone directory
npm install
cp .env.example .env        # set VITE_WC_PROJECT_ID
npm run dev
```

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Start Vite dev server         |
| `npm run build`| TypeScript check + production build |
| `npm run lint` | Run ESLint (TypeScript + React) |
| `npm run preview` | Preview production build  |
| `npm run update-browserslist` | Update caniuse data (removes “browsers data is X months old” build message) |

## Code and PRs

- **Lint**: Run `npm run lint` before committing. The project uses ESLint with TypeScript and React Hooks.
- **Types**: Keep strict TypeScript; avoid `any` in app code.
- **Scope**: The starter targets **Rootstock Mainnet (30) and Testnet (31)** and Collective DAO flows (connect → stake → proposals → vote) using **`@rsksmart/collective-sdk`** (Vite aliases to a placeholder only if the package is missing at install time).
- **Branches**: Prefer a feature branch and a short PR; describe what changed and why.

## Project layout

- **`src/constants/contracts.ts`**: App-side Collective addresses (Mainnet and Testnet) for reads/simulation.
- **`src/hooks/useCollective.ts`**: Collective SDK hook (`@rsksmart/collective-sdk`); built-in deployments on 30/31.
- **`src/components/dao/`**: ConnectWallet, StakingCard, ProposalList, VoteButton.
- **`src/lib/`**: Types (`collectiveStub`), errors, simulation, ABIs; `collectiveSdkPlaceholder` when the SDK package is not installed.

## Reporting issues

- **Bugs**: Open an issue with steps to reproduce, environment (Node version, browser), and expected vs actual behavior.
- **Security**: See [SECURITY.MD](SECURITY.MD) for disclosure.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see [LICENSE](LICENSE)).
