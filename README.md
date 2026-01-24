# AstraLink RWA Factory

**"Shopify for Asset Tokenization"** - A self-service platform for tokenizing real-world assets on Stellar blockchain.

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-blue)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Soroban-v25.0.0-green)](https://soroban.stellar.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🚀 Live on Stellar Testnet

**Contract ID:** `CBYZE6XD6NXCS3SMRI7PQWFJKJUB4WVMHC5ZWICAPPHP3LIYYKCN7IGE`

- [View on Stellar Lab](https://lab.stellar.org/r/testnet/contract/CBYZE6XD6NXCS3SMRI7PQWFJKJUB4WVMHC5ZWICAPPHP3LIYYKCN7IGE)
- [Deploy Transaction](https://stellar.expert/explorer/testnet/tx/128edb0b27ad59e3f38f70dc65b9264458045ad231a0508275619a2735ecf574)

## 📋 Overview

AstraLink democratizes access to $16 trillion in illiquid assets by reducing tokenization time from **6+ months to weeks** and costs by **90%**.

### Key Features

✅ **SEP-41 Compliant Token** - Full Stellar token standard implementation  
✅ **2-of-3 Multi-Sig Governance** - Institutional-grade security from day 1  
✅ **11-Step Compliance Engine** - Automated KYC/AML verification  
✅ **Multi-Jurisdiction Support** - US (Reg D/S), Singapore (VCC), EU (MiCA), UAE (SCA)  
✅ **Transfer Restrictions** - 90-day holding period, 10% ownership limit, $100k daily cap  
✅ **Emergency Controls** - Account freeze/unfreeze capabilities  
✅ **Complete Audit Trail** - Immutable transaction logging  

## 🏗️ Architecture

```
contracts/hello-world/src/
├── lib.rs          # Main contract (381 lines)
├── types.rs        # Data structures (102 lines)
├── errors.rs       # 40+ error codes
├── events.rs       # Event emissions
├── storage.rs      # Storage layer
├── compliance.rs   # 11-step verification engine
├── governance.rs   # Multi-sig system
└── test.rs         # 28 comprehensive tests
```

## 📊 Contract Stats

| Metric | Value |
|--------|-------|
| **WASM Size** | 23.7 KB |
| **Exported Functions** | 20 |
| **Total Supply** | 10,000,000 MTT |
| **Jurisdictions Supported** | 4 |
| **Tests** | 28 |

## 🛠️ Installation

### Prerequisites
```bash
rustc --version  # 1.70+
stellar --version  # Latest Stellar CLI
```

### Build
```bash
cd contracts/hello-world
stellar contract build
```

### Test
```bash
cargo test
```

### Deploy
```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/rwa_token.wasm \
  --network testnet \
  --source YOUR_KEY
```

## 🎯 Use Cases

- **Commercial Real Estate** - Tokenize properties with automatic compliance
- **Private Equity Funds** - Fractional ownership with accredited investor controls
- **Commodity Pools** - Global access with jurisdiction restrictions
- **Art & Collectibles** - Provenance tracking with KYC requirements

## 🔐 Security Features

- 2-of-3 multi-signature for all critical operations
- KYC/AML verification before every transfer
- Accredited investor checks (Reg D compliant)
- Holding period enforcement (90 days)
- Ownership concentration limits (10% max)
- Daily transfer caps ($100,000)
- Emergency account freeze capability

## 📚 API Functions

### Core Token Operations
- `transfer` - Compliance-gated token transfers
- `balance` - Check token holdings
- `approve` / `transfer_from` - Allowance system

### Governance (Multi-Sig Protected)
- `mint` / `burn` - Supply management
- `freeze_account` / `unfreeze_account` - Emergency controls
- `update_kyc` - Compliance record management

### Multi-Sig Workflow
- `propose` - Create governance proposals
- `approve_proposal` - Vote on proposals
- `get_proposal` - Query proposal status

### View Functions
- `name`, `symbol`, `decimals`, `total_supply`
- `get_kyc_status` - Check compliance records
- `is_frozen` - Check account status

## 🌍 Multi-Jurisdiction Compliance

| Jurisdiction | Regulation | Investor Types |
|--------------|-----------|----------------|
| 🇺🇸 USA | Reg D/S | Accredited |
| 🇸🇬 Singapore | VCC | Qualified |
| 🇪🇺 EU | MiCA | Institutional |
| 🇦🇪 UAE | SCA | All Types |

## 🚀 Roadmap

- [x] **Phase 1:** Core Token & Compliance Engine ✅
- [ ] **Phase 2:** Automated Dividend Distribution
- [ ] **Phase 3:** Enhanced Governance & Voting
- [ ] **Phase 4:** Secondary Market Integration
- [ ] **Phase 5:** Regulatory Reporting Dashboard

## 🎥 Demo

```bash
# Check token info
stellar contract invoke \
  --id CBYZE6XD6NXCS3SMRI7PQWFJKJUB4WVMHC5ZWICAPPHP3LIYYKCN7IGE \
  --network testnet \
  --source gov1 \
  -- name
# Returns: "Manhattan Tower Token"
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## 📞 Contact

- **Project:** AstraLink RWA Factory
- **Built with:** Stellar Soroban v25.0.0
- **Deployed:** January 24, 2026

---

**Built on Stellar. Secured with Multi-Sig. Compliant across 4 Jurisdictions.**
