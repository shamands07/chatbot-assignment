# Hasura Permissions Notes

- Use `user` role for frontend requests. RLS policies rely on `auth.uid()` supplied by Nhost JWT.
- For n8n server-side operations (inserting bot messages), use the Hasura **service role** key which bypasses RLS, or create a custom role with limited rights that allows inserting bot messages only.
- Ensure Hasura Action `sendMessage` has permission to be invoked by the `user` role (with appropriate input arguments).
