-- hasura/setup.sql
-- Creates chats and messages tables, enables RLS, and adds policies.

CREATE TABLE IF NOT EXISTS public.chats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id uuid REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id uuid, -- NULL for bot messages
  role text NOT NULL, -- 'user' | 'bot' | 'system'
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies: allow users to select/insert/update/delete only their chats/messages
CREATE POLICY "select_own_chats" ON public.chats
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "insert_chats" ON public.chats
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_chats" ON public.chats
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "delete_own_chats" ON public.chats
  FOR DELETE USING (user_id = auth.uid());

-- Messages: user may access messages in chats they own
CREATE POLICY "select_messages_if_chat_owner" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chats c WHERE c.id = chat_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "insert_message_owner_check" ON public.messages
  FOR INSERT WITH CHECK (
    (user_id = auth.uid()) OR (user_id IS NULL) -- allow bot messages inserted by service role
  );

CREATE POLICY "update_messages_if_owner" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.chats c WHERE c.id = chat_id AND c.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats c WHERE c.id = chat_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "delete_messages_if_owner" ON public.messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.chats c WHERE c.id = chat_id AND c.user_id = auth.uid()
    )
  );

-- Sample seed (optional)
INSERT INTO public.chats (id, user_id, title)
VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'Demo Chat')
ON CONFLICT DO NOTHING;

INSERT INTO public.messages (id, chat_id, user_id, role, content)
VALUES ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'user', 'Hello, this is a demo message.')
ON CONFLICT DO NOTHING;
