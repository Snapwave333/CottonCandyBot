# Installation Guide - Cotton Candy Bot v2.1.0-beta

## Step 1: Extract the Package
1. Download the `cotton-candy-bot-v2.1.0-beta.zip` archive.
2. Extract the contents to a folder of your choice (e.g., `C:\CottonCandyBot`).

## Step 2: Run the Installer
1. Double-click `install.bat`.
2. The script will verify your Node.js installation.
3. If `.env` is missing, it will create one from the template.
4. It will install all required dependencies.

## Step 3: Configuration
1. Open the `.env` file in a text editor (Notepad, VS Code, etc.).
2. Fill in your **SOLANA_RPC_URL** (Get one from QuickNode or Helius).
3. Set your **SECRET_KEY** and **API_KEY** (Refer to PRODUCTION_DEPLOYMENT.md for instructions on generating secure keys).
4. Configure your wallet and trading parameters.

## Step 4: Launching the Bot
1. Double-click `start.bat`.
2. The backend server and frontend dashboard will start automatically.
3. Access the dashboard at [http://localhost:3000](http://localhost:3000).

---

**Note:** For Linux users, please run `npm install --production` and use `npm run start` to launch.
