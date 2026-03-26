import React from 'react';
import SaleProductForm from '@/features/inventory/sale/SaleProductForm';



const InvoiceSaleProductForm = (props) => {
  return (
    <SaleProductForm
      {...props}
      onlyEditQuantity={true}
    />
  );
};

export default InvoiceSaleProductForm;
