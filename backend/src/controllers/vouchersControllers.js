import Voucher from '../models/Voucher.js'

export const getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 })
    res.status(200).json(vouchers)
  } catch (error) {
    console.error("Lỗi khi gọi getAllVouchers:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const getVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id)
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher không tồn tại' })
    }
    res.status(200).json(voucher)
  } catch (error) {
    console.error("Lỗi khi gọi getVoucher:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const createVoucher = async (req, res) => {
  try {
    const { name, description, type, value, quantity } = req.body

    // Validate required fields
    if (!name || !type || quantity === undefined) {
      return res.status(400).json({
        message: 'Vui lòng điền đầy đủ thông tin voucher'
      })
    }

    // Validate type    
    const validTypes = ['percentage', 'fixed', 'original_price']
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: 'Loại voucher không hợp lệ validTypes: percentage, fixed, original_price'
      })
    }

    // Validate value based on type
    if (type === 'percentage' && (value < 0 || value > 100)) {
      return res.status(400).json({
        message: 'Giá trị phần trăm phải từ 0 đến 100'
      })
    }
    if (type === 'fixed' && value < 0) {
      return res.status(400).json({
        message: 'Giá trị cố định phải lớn hơn hoặc bằng 0'
      })
    }
    if (type === 'original_price' && value !== undefined) {
      return res.status(400).json({
        message: 'Giá trị không được cung cấp khi loại voucher là original_price'
       })
     }

      // Tạo voucher index tự động: VO + mm + yy + xxxx (number)
    const now = new Date();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0'); 
    const yy = now.getFullYear().toString().slice(-2); 
    const prefix = `VO${mm}${yy}`;

    let index = 1;
    const lastVoucher = await Voucher.findOne({ voucherIndex: { $regex: `^${prefix}` } }).sort({ voucherIndex: -1 });
    if (lastVoucher && lastVoucher.voucherIndex) {
      const lastNumberStr = lastVoucher.voucherIndex.slice(-4);
      index = parseInt(lastNumberStr) + 1;
    }
    const voucherIndex = `${prefix}${index.toString().padStart(4, '0')}`;

    const voucher = new Voucher({
      voucherIndex,
      name: name.trim(),
      description: description || '',
      type,
      value,
      quantity
    })

    const newVoucher = await voucher.save()
    res.status(201).json(newVoucher)
  } catch (error) {
    console.error("Lỗi khi gọi createVoucher:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const updateVoucher = async (req, res) => {
  try {
    const allowedFields = ['name', 'description', 'type',  'value', 'quantity', 'active'];

    const updateData = Object.fromEntries(
      Object.entries(req.body)
        .filter(([key, value]) =>
          allowedFields.includes(key) && value !== undefined
        )
    );

    if (typeof updateData.name === "string") {
      updateData.name = updateData.name.trim();
    }

    const updatedVoucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedVoucher) {
      return res.status(404).json({ message: 'Voucher không tồn tại' });
    }

    res.status(200).json(updatedVoucher);
  } catch (error) {
    console.error("Lỗi khi gọi updateVoucher:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const deleteVoucher = async (req, res) => {
  try {
    const deletedVoucher = await Voucher.findByIdAndDelete(req.params.id)

    if (!deletedVoucher) {
      return res.status(404).json({ message: 'Voucher không tồn tại' })
    }

    res.status(200).json(deletedVoucher)
  } catch (error) {
    console.error("Lỗi khi gọi deleteVoucher:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}
