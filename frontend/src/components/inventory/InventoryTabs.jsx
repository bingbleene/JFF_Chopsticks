import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Package, ShoppingCart } from 'lucide-react';
import TotalInventory from './product/TotalInventory';
import SalesInventory from './sale/SalesInventory';

const InventoryTabs = ({
  activeTab,
  setActiveTab,
  availableTags = [],
  onAddTag = () => {},
  ...salesProps
}) => (
  <Tabs value={activeTab} onValueChange={setActiveTab}>
    <TabsList className="grid w-full grid-cols-2 mb-6">
      <TabsTrigger value="total" className="gap-2">
        <Package size={18} />
        Tổng kho
      </TabsTrigger>
      <TabsTrigger value="sales" className="gap-2">
        <ShoppingCart size={18} />
        Hàng bán
      </TabsTrigger>
    </TabsList>
    <TabsContent value="total">
      <TotalInventory availableTags={availableTags} onAddTag={onAddTag} />
    </TabsContent>
    <TabsContent value="sales">
      <SalesInventory availableTags={availableTags} onAddTag={onAddTag} {...salesProps} />
    </TabsContent>
  </Tabs>
);

export default InventoryTabs;
