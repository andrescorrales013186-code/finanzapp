import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';

const AuthCtx = createContext(null);

const googleProvider    = new GoogleAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.setCustomParameters({ prompt: 'select_account' });

export function AuthProvider({ children }) {
  // undefined = cargando, null = sin sesión, object = usuario logueado
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    // Procesa el resultado si Microsoft hizo redirect de vuelta
    getRedirectResult(auth)
      .then(result => { if (result?.user) setUser(result.user); })
      .catch(err => console.error('Redirect result error:', err.code, err.message));

    const unsub = onAuthStateChanged(auth, u => setUser(u || null));
    return unsub;
  }, []);

  const login              = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
  const register           = (email, pw) => createUserWithEmailAndPassword(auth, email, pw);
  const logout             = ()          => signOut(auth);
  const resetPassword      = (email)     => sendPasswordResetEmail(auth, email);
  const loginWithGoogle    = ()          => signInWithPopup(auth, googleProvider);
  const loginWithMicrosoft = ()          => signInWithRedirect(auth, microsoftProvider);

  return (
    <AuthCtx.Provider value={{ user, login, register, logout, resetPassword, loginWithGoogle, loginWithMicrosoft }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
