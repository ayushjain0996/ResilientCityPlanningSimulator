import { useAuth } from './auth/useAuth'
import AccountBar from './features/auth/AccountBar'
import LoginForm from './features/auth/LoginForm'
import MePanel from './features/auth/MePanel'
import HealthPanel from './features/health/HealthPanel'

function App() {
  const { user, loading } = useAuth()

  return (
    <main>
      <h1>Resilient City Planning Simulator</h1>
      {loading && <p>Loading...</p>}
      {!loading && user === null && <LoginForm />}
      {!loading && user !== null && (
        <>
          <AccountBar user={user} />
          <MePanel />
          <HealthPanel />
        </>
      )}
    </main>
  )
}

export default App
