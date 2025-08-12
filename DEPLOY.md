# DEPLOY.md — Step-by-step setup

## 1) Create Nhost project
1. Sign up at https://nhost.com and create a new project.
2. In Nhost dashboard:
   - Enable email/password authentication (Auth -> Providers).
   - Note down: Nhost backend URL (e.g., https://<project>.nhost.run) and the GraphQL endpoint (Hasura endpoint provided by Nhost).
   - Create a service role key (for server-side Hasura calls from n8n). Keep it secret.

## 2) Hasura (if self-hosted)
- If using Nhost, Hasura is already provided.
- Otherwise, deploy Hasura and Postgres and apply SQL from `hasura/setup.sql`.
- Import the action metadata `hasura/actions/sendMessage_action.json` into Hasura Actions (or add via console).

## 3) Apply SQL & permissions
Run the SQL in `hasura/setup.sql` against your Postgres database. This creates:
- `chats` and `messages` tables
- RLS policies and sample seeds
- Hasura action metadata (see `hasura/`)

## 4) n8n setup
1. Install n8n (cloud or self-hosted).
2. Create credentials:
   - `HasuraService` — GraphQL endpoint + admin/service role key (from step 1 or Hasura)
   - `OpenRouterAPI` — API key for OpenRouter (store in n8n credentials)
3. Import workflow from `n8n/hasura_send_message_workflow.json`.
4. Update the workflow node for the Hasura GraphQL endpoint and credentials.

## 5) Frontend
1. Install dependencies:
   ```
   cd frontend
   npm install
   ```
2. Set environment variables (Netlify or local `.env`):
   - VITE_NHOST_SUBDOMAIN=https://<your-nhost-url>
   - VITE_GRAPHQL_ENDPOINT=https://<your-hasura-graphql-endpoint>
   - VITE_HASURA_ACTION_SENDMESSAGE=sendMessage
3. Run locally:
   ```
   npm run dev
   ```

## 6) Netlify deploy
1. Create a new Netlify site from Git repository (after pushing).
2. Add build command: `npm run build` and publish directory `dist`.
3. Add environment variables (same as above plus Nhost client ID if needed).

## 7) Submission
Copy `SUBMISSION.txt` and paste to the assignment thread with the deployed Netlify link.

---

If you want, I can customize the README with screenshots once you deploy and provide the live URL.
