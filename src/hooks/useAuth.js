import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (firebaseUser) => {
    if (!firebaseUser) {
      setProfile(null);
      return;
    }

    const ref = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      setProfile({ id: firebaseUser.uid, ...snap.data() });
    } else {
      const data = {
        name: firebaseUser.displayName || "",
        email: firebaseUser.email,
        phone: "",
        rewards: 0,
        role: firebaseUser.email === "bubba@cafeteria.mx" ? "admin" : "user",
        createdAt: serverTimestamp(),
      };
      await setDoc(ref, data);
      setProfile(data);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser || null);
      if (firebaseUser) await loadProfile(firebaseUser);
      else setProfile(null);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const register = async (name, phone, email, password) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(res.user, { displayName: name });

    const data = {
      name,
      phone,
      email,
      rewards: 0,
      role: email === "bubba@cafeteria.mx" ? "admin" : "user",
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", res.user.uid), data);

    setUser(res.user);
    setProfile(data);
    return { ok: true };
  };

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
    return { ok: true };
  };

  const updateUserProfile = async (newData) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, newData);
    setProfile((prev) => ({ ...prev, ...newData }));
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  return {
    user,
    profile,
    loading,
    register,
    login,
    logout,
    updateUserProfile,
  };
}