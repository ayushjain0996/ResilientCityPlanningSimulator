import { logout, type AuthUser } from '../../auth/auth'

type AccountBarProps = {
  user: AuthUser
}

function AccountBar({ user }: AccountBarProps) {
  return (
    <p>
      Signed in as {user.email} ({user.role ?? 'no role assigned'}){' '}
      <button type="button" onClick={() => void logout()}>
        Sign out
      </button>
    </p>
  )
}

export default AccountBar
