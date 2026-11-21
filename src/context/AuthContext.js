// Keeps track of the logged-in user and exposes register / login / logout.
import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { createDefaultCourses } from '../services/courses';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Firebase tells us whenever the user logs in or out.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const register = async (name, email, password) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(newUser, { displayName: name });
    // Save the profile in the "users" collection, using the auth uid as the document id.
    await setDoc(doc(db, 'users', newUser.uid), {
      name,
      email,
      createdAt: serverTimestamp(),
    });
    // Every new student starts with the default CS courses.
    await createDefaultCourses(newUser.uid);
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, initializing, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// Turns Firebase error codes into readable messages.
export function authErrorMessage(error) {
  switch (error?.code) {
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Wrong email or password.';
    case 'auth/network-request-failed':
      return 'No internet connection.';
    default:
      return error?.message ?? 'Something went wrong.';
  }
}
