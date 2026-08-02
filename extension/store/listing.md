# Chrome Web Store listing copy

Paste-ready text for the dashboard's listing fields. Trim if a field's character limit flags it —
the dashboard enforces the exact current limits, which are worth trusting over any number written
here.

## The rule this copy exists to obey

**Never name a blockchain or a token in the listing metadata.** An earlier submission was rejected
as spam for the line _"Self-custody wallet for Ethereum, Solana, Bitcoin and five more networks"_,
and the description below it went further and named all eight. Coin names are among the most
contested search terms on the store, so a short summary stacked with three of them reads to
Google's Spam and Abuse policy (Keyword Spam) as ranking manipulation rather than description.
Describe what the product *does*; let the screenshots show which networks appear in the UI.

The disclosure paragraph sits at the end of the description — after the reader knows what the
thing is, which is where secondary information normally goes — but it is written plainly, in the
same size and voice as everything above it. It is not hidden, and it must not be cut: the product
shows a wallet that holds nothing and connects to nothing, and the listing has to say so.

## Name

Perigee Wallet

## Summary (short description)

Wallet interface for managing accounts, transfers, swaps and activity, running entirely on local
sample data.

## Description

Perigee is a self-custody wallet interface — a complete, navigable front end for creating an
account, receiving and sending assets, swapping, buying, and reviewing transaction history, with
multi-network switching and a full settings surface.

- Nothing is uploaded. The extension makes no network requests of any kind: no analytics, no
  crash reporting, no third-party SDKs.
- No permissions. It requests none, and cannot read your browsing activity, your other tabs, or
  any website's content.
- Nothing is stored. State lives in memory while the popup is open and is discarded when it
  closes.

What this build is: a preview of the interface, running on locally generated sample data. It does
not connect to any blockchain, generates no real keys, and cannot hold, send or receive real
funds. A wallet created here starts empty and stays empty — the balances you see are zero because
there is nothing behind them.

## Category

"Productivity" fits best in the current Chrome Web Store taxonomy; there is no dedicated
"crypto wallet" category. Confirm against whatever options the dashboard actually offers at
submission time.

## Language

English (the UI has no other locale).
