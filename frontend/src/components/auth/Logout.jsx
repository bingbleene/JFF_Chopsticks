import React from 'react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/useAuthStore'
import { useNavigate } from 'react-router'

const Logout = () => {
    const { signOut } = useAuthStore()

    const navigate = useNavigate()

    const handleLogout = async () => {
      try {
        await signOut()
        navigate('/signin')
      } catch (error) {
        console.error('Lỗi đăng xuất:', error)
        // Không chuyển trang nếu lỗi
      }
    }
  return (
    <Button onClick={handleLogout} className="font-medium">Đăng xuất</Button>
  )
}

export default Logout