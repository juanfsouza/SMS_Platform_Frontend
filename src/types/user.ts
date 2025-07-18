interface User {
  role: string;
  id: number;
  name: string;
  email: string;
  balance: number;
  affiliateBalance: number;
  affiliateLink: string | null;
  token: string | null;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  updateBalance: (balance: number, affiliateBalance?: number) => void;
}