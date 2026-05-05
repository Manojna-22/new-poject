import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message, type = 'info', duration = 3500) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((cur) => [...cur, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts((cur) => cur.filter(t => t.id !== id))
      }, duration)
    }
    return id
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((cur) => cur.filter(t => t.id !== id))
  }, [])

  // Memoize the api object so consumers' useCallback deps stay stable.
  const api = useMemo(() => ({
    success: (m) => push(m, 'success'),
    error:   (m) => push(m, 'error', 5000),
    info:    (m) => push(m, 'info'),
    dismiss,
  }), [push, dismiss])

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`} onClick={() => dismiss(t.id)}>
            <span className="icon">{t.type === 'success' ? '✓' : t.type === 'error' ? '!' : 'i'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
