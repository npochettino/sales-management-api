"use client"

import { getSession } from "next-auth/react";
import { useState, useEffect } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { signIn, signOut } from "next-auth/react"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Firebase auth successful", userCredential.user.uid);
  
      // Get the ID token
      const idToken = await userCredential.user.getIdToken();
      console.log("Got ID token", idToken.substring(0, 10) + "...");
  
      // Sign in with NextAuth
      const result = await signIn("credentials", {
        idToken,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      
      console.log("NextAuth sign in result:", result);
      
      if (result?.error) {
        return {
          success: false,
          error: result.error || "Failed to sign in with NextAuth",
        };
      }
  
      // Force a session refresh
      const session = await getSession();
      console.log("Session after login:", session);
  
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "Failed to sign in",
      };
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to register",
      }
    }
  }

  const logout = async () => {
    try {
      await firebaseSignOut(auth)
      await signOut({ redirect: false })
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to sign out",
      }
    }
  }

  return {
    user,
    loading,
    login,
    register,
    logout,
  }
}
