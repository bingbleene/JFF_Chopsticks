import React from 'react'
import { useNavigate } from 'react-router'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingCart, FileText, BarChart3 } from 'lucide-react'

const HomePage = () => {
  const navigate = useNavigate()

  const menuItems = [
    {
      id: 1,
      title: 'Quản lý hàng hóa',
      description: 'Quản lý sản phẩm kho và bán',
      icon: Package,
      href: '/products',
      color: 'bg-blue-100'
    },
    {
      id: 2,
      title: 'Tạo đơn nhập hàng',
      description: 'Nhập hàng từ nhà cung cấp',
      icon: ShoppingCart,
      href: '/import-orders',
      color: 'bg-green-100'
    },
    {
      id: 3,
      title: 'Tạo hóa đơn',
      description: 'Tạo hóa đơn bán hàng',
      icon: FileText,
      href: '/invoices',
      color: 'bg-purple-100'
    },
    {
      id: 4,
      title: 'Báo cáo thống kê',
      description: 'Xem báo cáo doanh số',
      icon: BarChart3,
      href: '/reports',
      color: 'bg-orange-100'
    }
  ]

  return (
    <div className="min-h-screen w-full bg-white relative">
      {/* Grid Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
    

      <div className="container pt-8 mx-auto">
        <div className="w-full max-w-6xl p-6 mx-auto space-y-6 relative z-10">
          {/* Header */}
          <Header />

          {/* Main content area - Menu grid */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Bảng điều khiển</h2>
              <p className="text-muted-foreground">Chọn chức năng bên dưới để bắt đầu</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {menuItems.map(item => {
                const Icon = item.icon
                return (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 h-full"
                    onClick={() => navigate(item.href)}
                  >
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mb-4`}>
                        <Icon size={24} className="text-gray-700" />
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(item.href)
                        }}
                      >
                        Truy cập
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default HomePage
