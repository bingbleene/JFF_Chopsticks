import Invoice from '../models/Invoice.js'
import Product from '../models/Product.js'
import SaleProduct from '../models/saleProduct.js'
import Voucher from '../models/Voucher.js'

export const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find()
          .populate('items.saleItemId', 'name price saleType')
          .populate('vouchers.voucherId', 'name type value')
          .populate('staff', 'name number')
          .sort({ dateBought: -1})
        res.status(200).json(invoices)
    } catch (error) {
        console.error("Lỗi khi gọi getAllInvoices:", error);
        res.status(500).json({ message: "Lỗi hệ thống" })
    }
}

export const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('items.saleItemId', 'name price saleType')
      .populate('vouchers.voucherId', 'name type value')
      .populate('staff', 'name number')
    if (!invoice) {
      return res.status(404).json({ message: 'Hóa đơn không tồn tại' })
    }
    res.status(200).json(invoice)
  } catch (error) {
    console.error("Lỗi khi gọi getInvoice:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const createInvoice = async (req, res) => {
  try {
    const {  items, staff, customer, paymentMethod, vouchers, note, status } = req.body

    if ( !items || !staff || items.length === 0 || !paymentMethod ) {
      return res.status(400).json({
        message: 'Vui lòng điền đầy đủ thông tin hóa đơn'
      })
    }

    // Tạo invoiceIndex tự động
    const now = new Date()

    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear().toString().slice(-2)

    const monthYear = `${month}${year}`

    // tìm hóa đơn gần nhất trong tháng
    const lastInvoice = await Invoice.findOne({
      invoiceIndex: new RegExp(`^HD${monthYear}`)
    }).sort({ createdAt: -1 })

    let nextNumber = 1

    if (lastInvoice) {
      // Nếu invoiceIndex có dấu '-', tách lấy số sau dấu '-', nếu không thì lấy 8 ký tự cuối
      let lastNumber = 1;
      const idx = lastInvoice.invoiceIndex.indexOf('-');
      if (idx !== -1) {
        lastNumber = parseInt(lastInvoice.invoiceIndex.slice(idx + 1))
      } else {
        lastNumber = parseInt(lastInvoice.invoiceIndex.slice(-4))
      }
      nextNumber = lastNumber + 1
    }

    const formattedNumber = String(nextNumber).padStart(4, '0')

    // Không dùng dấu '-' trong invoiceIndex nữa
    const invoiceIndex = `HD${monthYear}${formattedNumber}`

    // Sửa số lượng sản phẩm trong kho bán
    for (const item of items) {
        const saleProduct = await SaleProduct.findById(item.saleItemId)
        if (!saleProduct) {
          return res.status(404).json({ message: `Sản phẩm bán không tồn tại: ${item.saleItemId}` })
        }
        // Sửa số lượng sản phẩm trong kho
        saleProduct.quantity -= item.quantity;
        await saleProduct.save();

        for (const comboItem of saleProduct.items) {
            const comboSaleProduct = await Product.findById(comboItem.productId)
            if (comboSaleProduct) {
                comboSaleProduct.quantity -= comboItem.quantity * item.quantity;
                await comboSaleProduct.save();
            }
        }        
    }

    // Trừ số lượng voucher nếu có
        if (vouchers && vouchers.length > 0) {
            for (const voucherItem of vouchers) {
                const voucher = await Voucher.findById(voucherItem.voucherId);
                if (voucher) {
                    voucher.quantity -= voucherItem.quantity;
                    await voucher.save();
                }
            }
        }

    const invoice = new Invoice({
      invoiceIndex,
      items,
      staff,
      customer: customer || "Khach Le",
      paymentMethod: paymentMethod || "tien mat",
      vouchers: vouchers || [],
      note: note || "",
      status: status || "pending"
    })

    const newInvoice = await invoice.save()
    res.status(201).json(newInvoice)
  } catch (error) {
    console.error("Lỗi khi gọi createInvoice:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const updateInvoice = async (req, res) => {
  try {
    const allowedFields = [
      'invoiceIndex',
      // 'items',
      'staff',
      'customer',
      'paymentMethod',
      'vouchers',
      'note',
      'status'
    ];

    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(
        ([key, value]) => allowedFields.includes(key) && value !== undefined
      )
    );

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({ message: 'Hóa đơn không tồn tại' });
    }

    res.status(200).json(updatedInvoice);
  } catch (error) {
    console.error("Lỗi khi gọi updateInvoice:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const cancelInvoice = async (req, res) => {
  try {
    const { cancelReason } = req.body;

    if (!cancelReason || cancelReason.trim() === "") {
      return res.status(400).json({ message: "Vui lòng nhập lý do hủy hóa đơn" });
    }

    const cancelInvoice = await Invoice.findById(req.params.id);

    if (!cancelInvoice) {
      return res.status(404).json({ message: 'Hóa đơn không tồn tại' });
    }

    if (cancelInvoice.status === 'cancelled') {
      return res.status(400).json({ message: "Hóa đơn đã bị hủy trước đó" });
    }

    for (const item of cancelInvoice.items) {
      const saleProduct = await SaleProduct.findById(item.saleItemId);
      if (saleProduct) {
        saleProduct.quantity += item.quantity;
        await saleProduct.save();

        for (const comboItem of saleProduct.items) {
          const comboSaleProduct = await Product.findById(comboItem.productId);
          if (comboSaleProduct) {
            comboSaleProduct.quantity += comboItem.quantity * item.quantity;
            await comboSaleProduct.save();
          }
        }
      }
    }

    if (cancelInvoice.vouchers && cancelInvoice.vouchers.length > 0) {
      for (const voucherItem of cancelInvoice.vouchers) {
        const voucher = await Voucher.findById(voucherItem.voucherId);
        if (voucher) {
          voucher.quantity += voucherItem.quantity;
          await voucher.save();
        }
      }
    }

    cancelInvoice.status = 'cancelled';
    cancelInvoice.note = cancelInvoice.note
      ? `${cancelInvoice.note}\n[Lý do hủy]: ${cancelReason}`
      : `[Lý do hủy]: ${cancelReason}`;

    await cancelInvoice.save();

    res.status(200).json(cancelInvoice);

  } catch (error) {
    console.error("Lỗi khi gọi cancelInvoice:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id)

    if (!deletedInvoice) {
      return res.status(404).json({ message: 'Hóa đơn không tồn tại' })
    }
    //check status trước khi xóa, nếu chưa hủy thì mới hoàn trả số lượng sản phẩm và voucher
    if (deletedInvoice.status !== 'cancelled') {

      for (const item of deletedInvoice.items) {
          const saleProduct = await SaleProduct.findById(item.saleItemId)
          if (saleProduct) {
            // Trả lại số lượng sản phẩm trong kho
            saleProduct.quantity += item.quantity;
            await saleProduct.save();

              for (const comboItem of saleProduct.items) {
                  const comboSaleProduct = await Product.findById(comboItem.productId)
                  if (comboSaleProduct) {
                      comboSaleProduct.quantity += comboItem.quantity * item.quantity;
                      await comboSaleProduct.save();
                  }
              }
          }
      }

      // Trả lại số lượng voucher nếu có
      if (deletedInvoice.vouchers && deletedInvoice.vouchers.length > 0) {
          for (const voucherItem of deletedInvoice.vouchers) {
              const voucher = await Voucher.findById(voucherItem.voucherId);
              if (voucher) {
                  voucher.quantity += voucherItem.quantity;
                  await voucher.save();
              }
          }
      }
    }

    res.status(200).json(deletedInvoice)
  } catch (error) {
    console.error("Lỗi khi gọi deleteInvoice:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}
