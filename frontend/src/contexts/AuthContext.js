import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

// This is the key change. We import the initialized 'auth' object from a separate file.
import { auth, db } from '../firebase'; 

// Create the AuthContext to be used by components to access auth state and functions
export const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const googleProvider = new GoogleAuthProvider();

/**
 * AuthProvider component that wraps the application to provide authentication context.
 * It manages user state, handles login/register/logout using Firebase.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State to store authenticated user data
  const [loading, setLoading] = useState(true); // State to indicate if authentication status is being loaded

  // Effect hook to listen for Firebase auth state changes
  useEffect(() => {
    // This listener is crucial for keeping our React state in sync with Firebase's auth state.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Firebase user is signed in. We can now get their details.
        setUser(firebaseUser);
      } else {
        // User is signed out.
        setUser(null);
      }
      setLoading(false); // Authentication check is complete
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []); // Empty dependency array means this effect runs only once on mount

  // Function to handle Google Sign-in
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // The user's info can be found in result.user
      // We can also get the ID token if we need to send it to our backend
      const idToken = await result.user.getIdToken();
      console.log('Google login successful:', result.user);
      return { user: result.user, token: idToken };
    } catch (error) {
      console.error('Google login error:', error.message);
      throw error;
    }
  };

  // Function to handle email/password registration
  const registerWithEmail = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Send a verification email to the user
      await sendEmailVerification(userCredential.user);
      console.log('User registered. Verification email sent.');
      return userCredential.user;
    } catch (error) {
      console.error('Registration error:', error.message);
      throw error;
    }
  };

  // Function to handle email/password login
  const loginWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in with email:', userCredential.user);
      // You can add a check here for email verification status if needed
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  };

  // Function to handle password reset
  const sendPasswordResetEmailToUser = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent to:', email);
    } catch (error) {
      console.error('Password reset error:', error.message);
      throw error;
    }
  };

  // Function to handle user logout
  const logout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out.');
    } catch (error) {
      console.error('Logout error:', error.message);
      throw error;
    }
  };

  // The value provided to components wrapped by AuthProvider
  const value = {
    user,
    loading,
    signInWithGoogle,
    registerWithEmail,
    loginWithEmail,
    sendPasswordResetEmailToUser,
    logout
  };

  return (
    // Provide user, loading state, and auth functions to all children components
    <AuthContext.Provider value={value}>
      {/* Render children only when the initial authentication loading is complete */}
      {!loading && children}
    </AuthContext.Provider>
  );
};