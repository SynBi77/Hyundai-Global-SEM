# Hyundai Global SEM Dashboard

This is a Next.js application for the Hyundai Global SEM Dashboard.

## 🚀 Setting up on a New Machine (Home PC)

Since you are running this from home to bypass the corporate network block, follow these steps:

### 1. Clone the Repository
Open your terminal (or Command Prompt) and run:
```bash
git clone https://github.com/SynBi77/Hyundai-Global-SEM.git
cd Hyundai-Global-SEM
```

### 2. Install Dependencies
Install the required libraries (node_modules):
```bash
npm install
```

### 3. Create Environment File (.env.local)
**IMPORTANT:** The `.env.local` file is NOT saved to GitHub for security. You must create it manually.

1. Create a new file named `.env.local` in the project root.
2. Paste the following content (and fill in your real developer token):

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token_here
GOOGLE_ADS_CUSTOMER_ID=your_customer_id_here
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
The real Google Ads data should now load without the 404 error!
