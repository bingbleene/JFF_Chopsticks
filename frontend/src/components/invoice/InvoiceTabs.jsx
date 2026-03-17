import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Receipt, History } from 'lucide-react';
import InvoiceForm from './InvoiceForm';
import InvoiceHistory from './InvoiceHistory';

const InvoiceTabs = ({
  activeTab,
  setActiveTab,
  handleInvoiceCreated,
  ...historyProps
}) => (
  <Tabs value={activeTab} onValueChange={setActiveTab}>
    <TabsList className="grid w-full grid-cols-2 mb-6">
      <TabsTrigger value="create" className="gap-2">
        <Receipt size={18} />
        Tao hoa don
      </TabsTrigger>
      <TabsTrigger value="history" className="gap-2">
        <History size={18} />
        Lich su hoa don
      </TabsTrigger>
    </TabsList>
    <TabsContent value="create">
      <InvoiceForm onSuccess={handleInvoiceCreated} />
    </TabsContent>
    <TabsContent value="history">
      <InvoiceHistory {...historyProps} />
    </TabsContent>
  </Tabs>
);

export default InvoiceTabs;
