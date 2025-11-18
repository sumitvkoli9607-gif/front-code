import { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { SignInPage } from "./components/SignInPage";

interface User {
   id: string;
  name: string;
  email: string;
  avatar: string;
}

const SESSION_KEY = "user";
const EXPIRY_KEY = "sessionExpiry";

/** helper: get now + N hours in ms */
const expiryTime = (hours = 24) => Date.now() + hours * 60 * 60 * 1000;

function App() {
  const [user, setUser] = useState<User | null>(null);

  /* ---------- restore session (if still valid) ---------- */
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    const exp = localStorage.getItem(EXPIRY_KEY);

    if (stored && exp && Number(exp) > Date.now()) {
      setUser(JSON.parse(stored));
    } else {
      // expired or malformed → clean up
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(EXPIRY_KEY);
    }
  }, []);

  /* ---------- sign-in ---------- */
  const handleSignIn = (userData: User) => {
    setUser(userData);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    localStorage.setItem(EXPIRY_KEY, String(expiryTime()));
  };

  /* ---------- sign-out ---------- */
  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(EXPIRY_KEY);
  };

  /* ---------- render ---------- */
  if (!user) return <SignInPage onSignIn={handleSignIn} />;
  return <Dashboard user={user} onSignOut={handleSignOut} />;
}

export default App;