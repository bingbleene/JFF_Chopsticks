import React from 'react'
import { useNavigate, useLocation } from 'react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, Package, Receipt } from 'lucide-react'

const Navigation = ({ showBack = true, showHome = true }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const navLinks = [
    { path: '/', label: 'Trang chu', icon: Home },
    { path: '/products', label: 'Hang hoa', icon: Package },
    { path: '/invoices', label: 'Hoa don', icon: Receipt }
  ]

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        {showBack && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            Quay lai
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {navLinks.map(link => (
          <Button
            key={link.path}
            variant={location.pathname === link.path ? 'default' : 'outline'}
            size="sm"
            onClick={() => navigate(link.path)}
            className="gap-2"
          >
            <link.icon size={16} />
            {link.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default Navigation
