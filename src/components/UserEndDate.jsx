import { useState, useEffect } from 'react'
import { api } from '../../axios'
import dayjs from 'dayjs'
export function UserEndDate({ uid }) {
  const [endDate, setEndDate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    api.get(`/admin/users/${uid}/end-date`)
      .then(res => {
        console.log(res)
        if (isMounted && res.data?.date) {
          setEndDate(res.data.date)
        }
      })
      .catch(err => {
        console.error("Erreur récupération date de fin:", err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => { isMounted = false }
  }, [uid])

  if (loading) return <span style={{ color: '#9e9e9e' }}>...</span>
  if (!endDate) return <span>N/A</span>

  return <span>{endDate ? dayjs(endDate).format('DD/MM/YYYY') : '-'}</span>
}