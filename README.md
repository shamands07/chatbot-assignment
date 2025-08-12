# Chatbot Application — Internship Assessment (Nhost + Hasura + n8n)

**What this repo contains**
- Frontend: React app (Vite) using Bolt components + Nhost Auth integration (email sign-up/sign-in)
- GraphQL: All frontend <-> backend communication via Hasura GraphQL (queries, mutations, subscriptions)
- Hasura: SQL schema for `chats` and `messages`, RLS policies, permissions, and action metadata for `sendMessage`
- n8n: Workflow JSON to receive Hasura Action webhook, validate chat ownership, call OpenRouter, and insert bot responses via Hasura GraphQL
- Deployment: `netlify.toml`, deployment instructions, and a submission template

> This repository is ready to push to GitHub and deploy to Netlify. Follow the `DEPLOY.md` for step-by-step setup.

---

## Quick structure
- `frontend/` — React app (src, package.json, Netlify settings)
- `hasura/` — SQL to create tables, RLS policies, and sample seed data; Action metadata
- `n8n/` — Workflow JSON to import into n8n
- `DEPLOY.md` — Setup steps for Nhost, Hasura, n8n, Netlify and environment variables
- `SUBMISSION.txt` — text you can copy to the assignment thread

---

## Notes & conventions
- **Only GraphQL**: frontend uses GraphQL operations in `src/graphql/` and the Hasura `actions.sendMessage` action triggers the n8n workflow.
- **Security**: n8n holds external API keys (OpenRouter) and calls Hasura with admin/engineer role API key. Hasura Action JWT verification and Hasura permissions are included in the SQL and metadata.
- **RLS**: Row-Level Security ensures users only access their own chats/messages.

If you want, I can now walk you through a live deploy checklist, or modify UI colors/branding — tell me the brand colors or your preferred app name.
