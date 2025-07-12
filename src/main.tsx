import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'

// Replace with your actual Google OAuth Client ID
const GOOGLE_CLIENT_ID = "185155109068-99sb7kdthh5o9k8nd5ls3cn5hg6au1l3.apps.googleusercontent.com"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
  </StrictMode>,
)
