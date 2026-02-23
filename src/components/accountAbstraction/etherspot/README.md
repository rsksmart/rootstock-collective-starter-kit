
<p align="center">
  <img src="https://public.etherspot.io/assets/etherspot.gif" alt="Etherspot Logo" width= 150 height=150>
</p>

[Account Abstraction on Rootstock]()

# Etherspot Prime SDK!

### Step 1. Install Etherspot Prime SDK with this command

``` sh
yarn add @etherspot/prime-sdk
```


### Step 2. Import the Etherspot Prime SDK.

The example below is for **server-side or script** use (with env vars). **This starter kit does not use or require `WALLET_PRIVATE_KEY`**; the main DAO flows use the user’s connected wallet (Wagmi + RainbowKit). The Etherspot demo in this repo generates an ephemeral in-browser key for demo only.

```
  const primeSdk = new PrimeSdk(
    { privateKey: process.env.WALLET_PRIVATE_KEY }, 
    { 
      chainId: Number(process.env.CHAIN_ID), 
    },
  );
```