import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/clerk-react";
import AppWrapper from '@/components/appWrapper';

const Clerk_Key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!Clerk_Key) {
    throw new Error('Add your Clerk Publishable Key to the .env file')
  }
;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={Clerk_Key}>
      <BrowserRouter>
        <AppWrapper>
          <App />
        </AppWrapper>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
);


