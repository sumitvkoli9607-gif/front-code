import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; 

createRoot(document.getElementById("root")!).render(
  <StrictMode>
   <GoogleOAuthProvider clientId={CLIENT_ID}>  
       <PayPalScriptProvider
    options={{
      clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID, // <-- put your client-id in .env
      currency: 'USD',
      intent: 'subscription',          // we work with subscriptions
      components: 'buttons',
    }}
  >
   <App />
   </PayPalScriptProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
