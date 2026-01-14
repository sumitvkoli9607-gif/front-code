import { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom"; // Add this import
import { Dashboard } from "./components/Dashboard";
import { SignInPage } from "./components/SignInPage";

/* ---------- FULL user type (matches backend) ---------- */
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  availableBalance?: number;
  totalWithdrawn?: number;
  pendingWithdrawals?: number;
  subscription?: {
    plan: string;
    active: boolean;
    startDate?: string;
    expiryDate?: string;
  };
}

const SESSION_KEY = "user";
const EXPIRY_KEY = "sessionExpiry";

const expiryTime = (hours = 24) => Date.now() + hours * 60 * 60 * 1000;

function App() {
  const [user, setUser] = useState<User | null>(null);

  /* ---------- restore session ---------- */
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    const exp  = localStorage.getItem(EXPIRY_KEY);

    if (stored && exp && Number(exp) > Date.now()) {
      setUser(JSON.parse(stored));
    } else {
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

  /* ---------- user update (after payment) ---------- */
  const handleUserUpdate = (updated: User) => {
    setUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    localStorage.setItem(EXPIRY_KEY, String(expiryTime()));
  };

  /* ---------- render ---------- */
  if (!user) return <SignInPage onSignIn={handleSignIn} />;
  
  // Wrap Dashboard with Router
  return (
    <Router>
      <Dashboard
        user={user}
        onSignOut={handleSignOut}
        onUserUpdate={handleUserUpdate}
      />
    </Router>
  );
}

export default App;