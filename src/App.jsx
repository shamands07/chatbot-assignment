import React, { useEffect, useState } from 'react';
import { NhostClient, NhostProvider, useSignInEmailPassword, useSignUpEmailPassword, useUserData } from '@nhost/nhost-js';
import { GraphQLClient, gql } from 'graphql-request';

const nhost = new NhostClient({ backendUrl: import.meta.env.VITE_NHOST_BACKEND_URL });

function Auth() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nhostAuth = nhost.auth;

  async function signUp() {
    await nhostAuth.signUp({ email, password });
    alert('Signed up — confirm email then sign in.');
  }
  async function signIn() {
    await nhostAuth.signIn({ email, password });
    window.location.reload();
  }
  return (
    <div style={{maxWidth:400, margin:'2rem auto'}}>
      <h2>{mode==='signin'?'Sign in':'Sign up'}</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <div>
        {mode==='signin' ? <button onClick={signIn}>Sign In</button> : <button onClick={signUp}>Sign Up</button>}
        <button onClick={()=>setMode(mode==='signin'?'signup':'signin')}>Switch</button>
      </div>
    </div>
  );
}

function ChatApp() {
  const user = nhost.auth.getUser();
  const token = nhost.auth.getAccessToken();
  const gqlClient = new GraphQLClient(import.meta.env.VITE_GRAPHQL_ENDPOINT, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(()=>{ fetchChats(); }, []);

  async function fetchChats(){
    const query = gql`query MyChats { chats(where: {}, order_by: {created_at: desc}) { id title created_at } }`;
    const data = await gqlClient.request(query);
    setChats(data.chats || []);
  }

  async function createChat(){
    const mutation = gql`mutation CreateChat($title:String){ insert_chats_one(object:{user_id: "${user.id}", title:$title}){ id title } }`;
    const data = await gqlClient.request(mutation, { title: 'New Chat' });
    setChats(prev=>[data.insert_chats_one, ...prev]);
  }

  async function sendMessage(){
    if(!activeChat) return;
    // 1) Save user message
    const insert = gql`mutation InsertMessage($chat_id:uuid!, $content:String!){ insert_messages_one(object:{chat_id:$chat_id, user_id:"${user.id}", role:"user", content:$content}){ id } }`;
    await gqlClient.request(insert, { chat_id: activeChat.id, content: message });

    // 2) Call Hasura Action to trigger n8n -> OpenRouter
    const action = gql`mutation SendMessageAction($input: sendMessage_input!){ sendMessage(input: $input){ reply } }`;
    const variables = { input: { chat_id: activeChat.id, message } };
    try {
      const resp = await gqlClient.request(action, variables);
      // Response will contain reply text
      console.log('action reply', resp);
    } catch(e){
      console.error(e);
    }

    setMessage('');
  }

  return (
    <div style={{display:'flex'}}>
      <div style={{width:300, borderRight:'1px solid #ddd', padding:10}}>
        <button onClick={createChat}>+ New Chat</button>
        <ul>
          {chats.map(c=> <li key={c.id} onClick={()=>setActiveChat(c)} style={{cursor:'pointer'}}>{c.title || 'Untitled'}</li>)}
        </ul>
      </div>
      <div style={{flex:1, padding:10}}>
        <h3>{activeChat?.title || 'Select a chat'}</h3>
        <div style={{height:400, overflow:'auto', border:'1px solid #eee', padding:8}}>
          {/* subscribe to messages via GraphQL subscriptions in full implementation */}
          <p>Messages will appear here (demo shell)</p>
        </div>
        <div>
          <input value={message} onChange={e=>setMessage(e.target.value)} placeholder="Type a message..." />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const user = nhost.auth.getUser();
  if(!user) return <Auth />;
  return <ChatApp />;
}
