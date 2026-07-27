import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER'

type AuthUser = {
  id: string
  email: string
  roles: UserRole[]
}

type ProtectedRouteProps = {
  allowedRoles?: UserRole[]
  children?: ReactNode
}

const ACCESS_TOKEN_STORAGE_KEY = 'accessToken'
const AUTH_USER_STORAGE_KEY = 'authUser'

function getAuthUser(): AuthUser | null {
  const rawUser = localStorage.getItem(AUTH_USER_STORAGE_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser) as AuthUser
  } catch {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    return null
  }
}

function hasRequiredRole(userRoles: UserRole[], allowedRoles?: UserRole[]) {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true
  }

  return allowedRoles.some((role) => userRoles.includes(role))
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const location = useLocation()
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  const user = getAuthUser()

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!hasRequiredRole(user.roles, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children ?? <Outlet />
}

export default ProtectedRoute
