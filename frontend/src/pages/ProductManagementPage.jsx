import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Navigation from '../components/Navigation'
import InventoryTabs from '../components/inventory/InventoryTabs'

const ProductManagementPage = () => {
  const [activeTab, setActiveTab] = useState('total')
  const [availableTags, setAvailableTags] = useState([])

  const handleAddTag = (newTag) => {
    if (newTag && !availableTags.includes(newTag)) {
      setAvailableTags([...availableTags, newTag])
    }
  }

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
        <div className="w-full max-w-7xl p-6 mx-auto space-y-6 relative z-10">
          {/* Navigation */}
          <Navigation />

          {/* Header */}
          <Header />

          {/* Tabs Navigation */}
          <InventoryTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            availableTags={availableTags}
            onAddTag={handleAddTag}
          />

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default ProductManagementPage
