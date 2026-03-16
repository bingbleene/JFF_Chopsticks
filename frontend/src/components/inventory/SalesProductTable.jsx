import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit2, Trash2 } from 'lucide-react'

const SALE_TYPES = {
  retail: { label: 'Bán lẻ', color: 'default' },
  combo: { label: 'Bán combo', color: 'secondary' },
  box: { label: 'Bán box', color: 'info' }
}

const SalesProductTable = ({ products, onEdit, onDelete }) => {
  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên sản phẩm</TableHead>
            <TableHead>Loại bán</TableHead>
            <TableHead className="text-right">Giá gốc</TableHead>
            <TableHead className="text-right">Giá bán</TableHead>
            <TableHead className="text-right">Kho còn</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map(product => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                <Badge variant={SALE_TYPES[product.saleType]?.color || 'default'}>
                  {SALE_TYPES[product.saleType]?.label || product.saleType}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(product.originalPrice)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(product.customPrice || product.originalPrice)}
              </TableCell>
              <TableCell className="text-right">
                <span className="bg-info/10 text-info px-2 py-1 rounded">
                  {product.quantity}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(product)}
                  className="gap-1"
                >
                  <Edit2 size={16} />
                  Sửa
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(product.id)}
                  className="gap-1"
                >
                  <Trash2 size={16} />
                  Xóa
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default SalesProductTable
