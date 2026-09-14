import { useState, useCallback } from 'react'
import UsersCreate from './UsersCreate'
import UsersList from './UsersList'

export default function DataTable() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUserAdded = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  return (
    <>
      <UsersCreate onUserAdded={handleUserAdded} />
      <UsersList refreshTrigger={refreshTrigger} />
    </>
  )
}
