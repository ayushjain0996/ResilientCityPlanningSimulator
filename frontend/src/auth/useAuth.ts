import { useEffect, useState } from 'react'
import { onAuthChange, type AuthUser } from './auth'

export function useAuth(): { user: AuthUser | null; loading: boolean } {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthChange((authUser) => {
      setUser(authUser)
      setLoading(false)
    })
  }, [])

  return { user, loading }
}
