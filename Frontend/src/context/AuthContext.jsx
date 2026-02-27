import { createContext, useContext, useCallback, useState, useEffect } from 'react';

/**
 * AuthContext
 * Stores users list + active session in localStorage.
 * Passwords are stored as-is (simulation only – not for production).
 *
 * localStorage keys:
 *   sw_users         – array of registered users
 *   sw_session       – currently logged-in user (id, name, email, avatar?)
 */

const AuthContext = createContext(null);

/* ── helpers ───────────────────────────────────────────────── */
const LS_USERS   = 'sw_users';
const LS_SESSION = 'sw_session';

const readLS  = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const writeLS = (key, val)      => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

/**
 * Safely decode a Google Identity Services JWT credential.
 * Returns the parsed payload object or null on failure.
 */
function decodeGoogleJwt(credential) {
  try {
    const payload = credential.split('.')[1];
    // pad base64url to standard base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/* ── provider ──────────────────────────────────────────────── */
export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => readLS(LS_SESSION, null));   // current user (public info)
  const [users, setUsers] = useState(() => readLS(LS_USERS,   []));     // all registered accounts

  /* Sync users list to LS whenever it changes */
  useEffect(() => { writeLS(LS_USERS, users); }, [users]);

  /* ── register ────────────────────────────────────────────── */
  const register = useCallback(({ name, email, password }) => {
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return { ok: false, error: 'An account with this email already exists.' };

    const newUser = { id: uid(), name: name.trim(), email: email.trim().toLowerCase(), password, createdAt: new Date().toISOString() };
    const updated = [...users, newUser];
    setUsers(updated);
    writeLS(LS_USERS, updated);

    const session = { id: newUser.id, name: newUser.name, email: newUser.email };
    setUser(session);
    writeLS(LS_SESSION, session);
    return { ok: true };
  }, [users]);

  /* ── login ───────────────────────────────────────────────── */
  const login = useCallback(({ email, password }) => {
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return { ok: false, error: 'Invalid email or password.' };

    const session = { id: found.id, name: found.name, email: found.email };
    setUser(session);
    writeLS(LS_SESSION, session);
    return { ok: true };
  }, [users]);

  /* ── logout ──────────────────────────────────────────────── */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(LS_SESSION);
  }, []);

  /* ── Google OAuth login / register ──────────────────────── */

  /**
   * loginWithGoogleProfile – accepts a plain profile object.
   * Used by both the real GoogleLogin (after JWT decode) and demo mode.
   */
  const loginWithGoogleProfile = useCallback(({ sub, name, email, picture }) => {
    // Find existing account by email
    let existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      // Merge google avatar & provider onto existing account if not already google
      if (!existing.provider) {
        const merged = { ...existing, avatar: picture, googleSub: sub };
        setUsers(prev => prev.map(u => u.id === existing.id ? merged : u));
        existing = merged;
      }
    } else {
      // Auto-register new Google user (no password)
      existing = {
        id: uid(),
        name: name ?? email.split('@')[0],
        email: email.toLowerCase(),
        avatar: picture,
        googleSub: sub,
        provider: 'google',
        createdAt: new Date().toISOString(),
      };
      const updated = [...users, existing];
      setUsers(updated);
      writeLS(LS_USERS, updated);
    }

    const session = { id: existing.id, name: existing.name, email: existing.email, avatar: existing.avatar };
    setUser(session);
    writeLS(LS_SESSION, session);
    return { ok: true };
  }, [users]);

  /** loginWithGoogle – decodes real Google JWT then delegates */
  const loginWithGoogle = useCallback((credential) => {
    const profile = decodeGoogleJwt(credential);
    if (!profile) return { ok: false, error: 'Google sign-in failed. Please try again.' };
    const { sub, name, email, picture, email_verified } = profile;
    if (!email_verified) return { ok: false, error: 'Google account email is not verified.' };
    return loginWithGoogleProfile({ sub, name, email, picture });
  }, [loginWithGoogleProfile]);

  /* ── update name ─────────────────────────────────────────── */
  const updateName = useCallback((newName) => {
    setUsers(prev => prev.map(u => u.id === user?.id ? { ...u, name: newName } : u));
    const updated = { ...user, name: newName };
    setUser(updated);
    writeLS(LS_SESSION, updated);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, register, login, loginWithGoogle, loginWithGoogleProfile, logout, updateName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside <AuthProvider>');
  return ctx;
}
