import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Combobox, ComboboxInput, ComboboxContent, ComboboxEmpty, ComboboxList, ComboboxItem } from '@/components/ui/combobox';
import { getAvailableStockForProduct } from '@/utils/checkQuantityForSaleProduct';

const SaleProductFields = ({
  formData,
  setFormData,
  errors = {},
  products = [],
  saleProduct = null,
  onlyEditQuantity = false,
  disableName = false,
  disablePrice = false,
  disableItems = false,
  disableQuantity = false,
  handleItemChange,
  handleAddItem,
}) => {
  const isRetail = formData.saleType === 'retail';

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="name">Tên sản phẩm bán *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder={isRetail ? 'VD: Sticker BL' : 'VD: Combo Dây đeo & Bao thẻ'}
            className={errors.name ? 'border-destructive' : ''}
            disabled={onlyEditQuantity || disableName}
            tabIndex={onlyEditQuantity || disableName ? -1 : 0}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="price">Giá bán (VND) *</Label>
          <div className="relative">
            <Input
              id="price"
              name="price"
              inputMode="numeric"
              value={formData.price === '' ? '' : Number(formData.price).toLocaleString('vi-VN')}
              onChange={e => {
                const raw = e.target.value.replace(/[^\d]/g, '');
                setFormData(prev => ({ ...prev, price: raw }));
              }}
              placeholder="0"
              min="0"
              className={errors.price ? 'border-destructive' : ''}
              autoComplete="off"
              disabled={onlyEditQuantity || disablePrice}
              tabIndex={onlyEditQuantity || disablePrice ? -1 : 0}
            />
          </div>
          {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="quantity">Số lượng *</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
            placeholder="0"
            min="0"
            step="1"
            className={errors.quantity ? 'border-destructive' : ''}
            disabled={disableQuantity}
          />
          {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
        </div>
      </div>
      {/* Sản phẩm gốc */}
      <div className="space-y-2 mt-3">
        <Label>{isRetail ? 'Sản phẩm gốc (chỉ 1 sản phẩm) *' : 'Sản phẩm trong combo *'}</Label>
        {errors.items && <p className="text-xs text-destructive">{errors.items}</p>}
        {isRetail ? (
          <>
            <Combobox
              items={products}
              value={products.find(p => (p._id === formData.items[0]?.productId || p.id === formData.items[0]?.productId)) || null}
              onValueChange={val => setFormData(prev => ({ ...prev, items: [{ productId: val ? (val._id || val.id) : '', quantity: 1 }] }))}
              itemToStringValue={p => p?.name || ''}
              disabled={onlyEditQuantity || disableItems}
            >
              <ComboboxInput
                placeholder="Chọn sản phẩm gốc"
                value={products.find(p => (p._id === formData.items[0]?.productId || p.id === formData.items[0]?.productId))?.name || ''}
                readOnly
                tabIndex={onlyEditQuantity || disableItems ? -1 : 0}
              />
              <ComboboxContent className="w-[--radix-popover-trigger-width] max-h-60 overflow-y-auto">
                <ComboboxEmpty>Không có sản phẩm.</ComboboxEmpty>
                <ComboboxList>
                  {(p) => (
                    <ComboboxItem key={p._id || p.id} value={p}>
                      {p.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {/* Hiển thị tồn kho cho sản phẩm gốc đã chọn */}
            {(() => {
              const selected = products.find(p => (p._id === formData.items[0]?.productId || p.id === formData.items[0]?.productId));
              if (selected && typeof selected.quantity === 'number') {
                const productId = selected._id || selected.id;
                const availableStock = getAvailableStockForProduct(productId, products, saleProduct || null);
                return (
                  <div className="text-xs text-muted-foreground mt-1">
                    Tồn kho: <span className="font-semibold">{availableStock.toLocaleString('vi-VN')} {selected.unit || 'cái'}</span>
                  </div>
                );
              }
              return null;
            })()}
          </>
        ) : (
          <div className="space-y-2">
            {/* Tiêu đề các cột */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-1 pl-1">
              <div className="w-56">Sản phẩm</div>
              <div className="w-20 text-center">Số lượng</div>
              <div className="w-24 text-center">Tồn kho</div>
              <div className="w-8" />
            </div>
            {formData.items.map((item, index) => {
              const productInfo = products.find(p => (p._id === item.productId || p.id === item.productId));
              let stock = '';
              if (productInfo && productInfo.quantity !== undefined) {
                const productId = productInfo._id || productInfo.id;
                const availableStock = getAvailableStockForProduct(productId, products, saleProduct || null);
                stock = availableStock.toLocaleString('vi-VN') + ' ' + (productInfo.unit || 'cái');
              }
              return (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <div className="w-56">
                    <Combobox
                      items={products}
                      value={products.find(p => (p._id === item.productId || p.id === item.productId)) || null}
                      onValueChange={val => handleItemChange(index, 'productId', val ? (val._id || val.id) : '')}
                      itemToStringValue={p => p?.name || ''}
                      disabled={onlyEditQuantity || disableItems}
                    >
                      <ComboboxInput
                        placeholder="Chọn sản phẩm"
                        value={products.find(p => (p._id === item.productId || p.id === item.productId))?.name || ''}
                        readOnly
                        tabIndex={onlyEditQuantity || disableItems ? -1 : 0}
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>Không có sản phẩm.</ComboboxEmpty>
                        <ComboboxList>
                          {(p) => (
                            <ComboboxItem key={p._id || p.id} value={p}>
                              {p.name} (Kho: {p.quantity} {p.unit || 'cái'})
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                      placeholder="Số lượng"
                      min="1"
                      step="1"
                      className={errors[`item_${index}_quantity`] ? 'border-destructive' : ''}
                      disabled={onlyEditQuantity || disableItems}
                      tabIndex={onlyEditQuantity || disableItems ? -1 : 0}
                    />
                  </div>
                  <div className="w-24 text-center text-xs text-muted-foreground">
                    {productInfo && typeof productInfo.quantity === 'number'
                      ? stock
                      : <span className="italic">Chưa có</span>}
                  </div>
                  <div className="w-8" />
                </div>
              );
            })}
            <Button
              type="button"
              className="mt-2 flex items-center gap-2"
              variant="outline"
              onClick={handleAddItem}
              disabled={onlyEditQuantity || disableItems}
            >
              <span className="text-lg font-bold">+</span> Thêm sản phẩm
            </Button>
          </div>
        )}
      </div>
      <div className="mb-4" />
    </>
  );
};

export default SaleProductFields;
