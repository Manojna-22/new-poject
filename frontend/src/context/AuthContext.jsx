import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi, tokenStore, userStore, extractError } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => userStore.get())
  const [loading, setLoading] = useState(false)

  // Hydrate user from storage on mount (handles cross-tab)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'hmi_user' || e.key === 'hmi_token') {
        setUser(userStore.get())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const signin = useCallback(async (username, password) => {
    setLoading(true)
    try {
      const { data } = await authApi.signin({ username, password })
      tokenStore.set(data.token)
      const u = {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        expiresAt: data.expiresAt,
      }
      userStore.set(u)
      setUser(u)
      return u
    } catch (err) {
      throw new Error(extractError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(async (payload) => {
    setLoading(true)
    try {
      const { data } = await authApi.signup(payload)
      tokenStore.set(data.token)
      const u = {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        expiresAt: data.expiresAt,
      }
      userStore.set(u)
      setUser(u)
      return u
    } catch (err) {
      throw new Error(extractError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const signout = useCallback(async () => {
    try { await authApi.signout() } catch (_) { /* best effort */ }
    tokenStore.clear()
    userStore.clear()
    setUser(null)
  }, [])

  const isAdmin = user?.role === 'ROLE_ADMIN'
  const isOperator = user?.role === 'ROLE_OPERATOR'

  return (
    <AuthContext.Provider value={{
      user, loading, signin, signup, signout, isAdmin, isOperator,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
