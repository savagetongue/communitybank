# ChronoBank

A minimalist, community-driven platform for exchanging services and skills using time as currency.

ChronoBank is a modern, minimalist time-banking platform where users can exchange services for time credits instead of traditional currency. It operates on a peer-to-peer model, allowing members to both offer their skills and request services from others. The core currency is one hour of time, creating a fair and equitable system of exchange. The platform includes robust features for account management, service listings (Offers), booking, a secure escrow system for time credits, a detailed transaction ledger, user ratings, and an admin-moderated dispute resolution process.

[cloudflarebutton]

## ✨ Key Features

*   **Auth & Accounts**: Secure registration, login, and role management (Member, Provider, Admin).
*   **Offers Marketplace**: Providers can create, edit, and manage their service offerings.
*   **Service Requests**: Members can easily request services from available offers.
*   **Booking & Escrow**: A complete booking system with an integrated time credit escrow to ensure fair transactions.
*   **Time Credit Ledger**: A detailed, immutable ledger for all time credit transactions (debits, credits, adjustments).
*   **Ratings & Reviews**: A feedback system for members and providers to build trust within the community.
*   **Dispute Resolution**: An admin-moderated system for handling disputes, including evidence submission.
*   **Admin Panel**: A comprehensive dashboard for administrators to manage the platform, resolve disputes, and view reports.

## 🛠️ Technology Stack

*   **Frontend**: React, Vite, React Router, Tailwind CSS, shadcn/ui
*   **State Management**: Zustand
*   **Backend**: Cloudflare Workers, Hono
*   **Storage**: Cloudflare Durable Objects
*   **UI/UX**: Framer Motion, Lucide React
*   **Forms & Validation**: React Hook Form, Zod
*   **Language**: TypeScript

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Bun](https://bun.sh/) installed on your machine.
*   A [Cloudflare account](https://dash.cloudflare.com/sign-up).
*   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated.

### Installation & Configuration

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd chronobank
    ```

2.  **Install dependencies:**
    This project uses Bun for package management.
    ```bash
    bun install
    ```

3.  **Configure Cloudflare Secrets:**
    The application requires several secrets to be set in your Cloudflare environment for the backend worker to function correctly. These are **not** stored in the repository.

    Run the following commands, replacing the placeholder values with your actual database credentials and a secure API key.

    ```bash
    # Database Credentials
    wrangler secret put DB_HOST
    wrangler secret put DB_PORT
    wrangler secret put DB_USER
    wrangler secret put DB_PASS
    wrangler secret put DB_NAME

    # Worker API Key (for secure communication)
    wrangler secret put WORKER_API_KEY
    ```

## 💻 Development

To start the local development server, which includes both the Vite frontend and a local instance of the Cloudflare Worker, run:

```bash
bun run dev
```

This will start the frontend application, typically available at `http://localhost:3000`. The Vite development server will automatically proxy API requests from `/api/*` to your local worker instance.

## ☁️ Deployment

To deploy the application to your Cloudflare account, simply run the deployment script:

```bash
bun run deploy
```

This command will:
1.  Build the React frontend for production.
2.  Deploy the Cloudflare Worker and the static frontend assets to your Cloudflare account.

Alternatively, you can deploy directly from your GitHub repository using the button below.

[cloudflarebutton]

## 📂 Project Structure

The codebase is organized into three main directories:

*   `src/`: Contains the entire React frontend application, including pages, components, hooks, and styles.
*   `worker/`: Contains the Hono-based Cloudflare Worker backend, including API routes, entity definitions, and core Durable Object logic.
*   `shared/`: Contains TypeScript types and interfaces that are shared between the frontend and the backend to ensure type safety.

## 🛡️ Security

This project template is built with security in mind:
*   **Secrets Management**: All sensitive keys and credentials are managed via Cloudflare's encrypted secrets.
*   **SQL Injection Prevention**: All database interactions are designed to use prepared statements or parameterized queries.
*   **Secure by Default**: The architecture leverages Cloudflare's robust infrastructure for a secure foundation.