<div align="center">

![CottonCandyBot Hero Banner](./assets/banner.png)

# 🍬 CottonCandyBot
### *The Sweetest Alpha on Solana.*

[![Solana](https://img.shields.io/badge/Chain-Solana-blue?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-pink?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-1.0.0--beta-cyan?style=for-the-badge)](https://github.com/Snapwave333/CottonCandyBot)

---

**CottonCandyBot** is a high-performance, full-stack Solana trading terminal engineered for speed, security, and precision. It combines a reactive Next.js dashboard with a hardened Node.js execution engine to deliver 200ms tick-loops, MEV protection, and advanced trading strategies.

[Features](#-feature-breakdown) • [Architecture](#-architecture-overview) • [Installation](#-installation--setup) • [Roadmap](#-roadmap)

</div>

---

## 🚀 Feature Breakdown

- **⚡ Lightning Execution:** Sub-200ms tick-loop architecture powered by optimized Web Workers.
- **🛡️ MEV Protection:** Seamless Jito integration for anti-sandwich bundle submission.
- **📈 Advanced Strategies:** Out-of-the-box support for Sniper, DCA, Momentum, and Dip Catching.
- **📊 Real-time Telemetry:** Live P/L tracking, wallet clustering visualization, and interactive charts.
- **🔐 Hardened Security:** AES-256-CBC encryption for local key management.
- **🍬 ELI5 Mode:** Built-in tooltips and simplified UI for complex trading concepts.

---

## 🏗️ Architecture Overview

CottonCandyBot employs a decoupled architecture to ensure maximum performance and UI responsiveness.

- **Frontend (Next.js):** Manages the "Ticker Store" for high-frequency updates and offloads strategy evaluation to dedicated **Web Workers**.
- **Execution Engine (Node.js):** A centralized hub for transaction signing, Jito bundle submission, and secure wallet management.
- **Data Layer (LowDB):** Lightweight, persistent JSON storage for settings and encrypted keys.

```mermaid
graph TD
    User([User]) <-->|React Context| Dashboard[Next.js Dashboard]
    Dashboard <-->|Socket.io| Backend[Node.js Engine]
    
    subgraph Execution
        Backend -->|web3.js| Solana[Solana Blockchain]
        Backend -->|Bundles| Jito[Jito MEV]
        Backend -->|Persistence| DB[(LowDB)]
    end
    
    subgraph UI Optimization
        Dashboard -->|Workers| Evaluation[Strategy Evaluator]
        Dashboard -->|Volatile| Store[Fast Ticker Store]
    end
```

---

## 🛠️ Technology Stack

<div align="center">

| Component | technologies |
| :--- | :--- |
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) |
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white) ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socketdotio&logoColor=white) |
| **Blockchain** | ![Solana](https://img.shields.io/badge/Solana-9945FF?style=flat-square&logo=solana&logoColor=white) ![Web3.js](https://img.shields.io/badge/Web3.js-F16822?style=flat-square&logo=web3dotjs&logoColor=white) |

</div>

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Node.js** v18 or higher
- **NPM** or **Yarn**
- A high-performance Solana RPC (Helius, QuickNode, or similar)

### 2. Clone and Install
```bash
git clone https://github.com/Snapwave333/CottonCandyBot.git
cd CottonCandyBot
npm install
```

### 3. Backend Setup
```bash
cd server
npm install
cp .env.example .env
```
Edit your `.env` file with your `RPC_URL` and `SECRET_KEY`.

---

## 🎮 Usage

### Quick Start
We provide a unified startup script for Windows:
```powershell
./start_bot.bat
```

### Manual Mode
To run components separately:

**Start Backend (with auto-reload):**
```bash
npm run server:dev
```

**Start Frontend:**
```bash
npm run dev
```

---

## 🖼️ Assets

<div align="center">

| Mascot | Preview |
| :--- | :--- |
| ![Mascot](./assets/logo.png) | *Modern, Playful, Precise.* |

</div>

---

## 🗺️ Roadmap

- [ ] **Q1 2026:** Jupiter V6 SDK Integration (Priority)
- [ ] **Q1 2026:** Multi-wallet Swarm Trading implementation
- [ ] **Q2 2026:** Telegram Bot Interface for mobile alerts
- [ ] **Q3 2026:** AI-assisted Technical Analysis module

---

## 🤝 Contribution Guidelines

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/SweetUpdate`)
3. Commit your Changes (`git commit -m 'Add some Sweetness'`)
4. Push to the Branch (`git push origin feature/SweetUpdate`)
5. Open a Pull Request

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
    Built with 💖 for the Solana Ecosystem.
</div>
