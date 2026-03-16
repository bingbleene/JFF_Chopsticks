import React from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen w-full bg-gradient-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-2xl font-semibold text-foreground">Trang không tìm thấy</p>
        <p className="text-muted-foreground">Xin lỗi, trang bạn tìm kiếm không tồn tại.</p>
        <Button onClick={() => navigate('/')}>Về trang chủ</Button>
      </div>
    </div>
  )
}

export default NotFound
