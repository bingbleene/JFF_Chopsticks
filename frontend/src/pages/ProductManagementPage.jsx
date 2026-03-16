import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Navigation from '../components/Navigation'
import TotalInventory from '../components/inventory/TotalInventory'
import SalesInventory from '../components/inventory/SalesInventory'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const ProductManagementPage = () => {
  const [activeTab, setActiveTab] = useState('total')
  const [availableTags, setAvailableTags] = useState([])

  const handleAddTag = (newTag) => {
    if (newTag && !availableTags.includes(newTag)) {
      setAvailableTags([...availableTags, newTag])
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-background relative">
      {/* Background gradient accent */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15), transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.15), transparent 50%)`,
        }}
      />

      <div className="container pt-8 mx-auto">
        <div className="w-full max-w-7xl p-6 mx-auto space-y-6 relative z-10">
          {/* Navigation */}
          <Navigation />

          {/* Header */}
          <Header />

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            

            {/* Total Inventory Tab */}
            <TabsContent value="total" className="space-y-6">
              <TotalInventory availableTags={availableTags} onAddTag={handleAddTag} />
            </TabsContent>

            {/* Sales Inventory Tab */}
            <TabsContent value="sales" className="space-y-6">
              <SalesInventory />
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default ProductManagementPage
