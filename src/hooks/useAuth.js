// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mantener sesión activa
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Crear usuario nuevo
  const register = async (fullName, email, password) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // Guardar nombre en Firebase Auth
      await updateProfile(res.user, {
        displayName: fullName,
      });

      // Registrar usuario en Firestore
      await setDoc(doc(db, "users", res.user.uid), {
        fullName,
        email,
        createdAt: new Date(),
      });

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  };

  // Iniciar sesión
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  };

  // Cerrar sesión
  const logout = async () => {
    await signOut(auth);
  };

  return {
    user,
    loading,
    register,
    login,
    logout,
  };
}