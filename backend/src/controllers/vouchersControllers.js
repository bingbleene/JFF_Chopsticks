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
    const { name, description, price, quantity } = req.body

    // Validate required fields
    if (!name || !price || quantity === undefined) {
      return res.status(400).json({
        message: 'Vui lòng điền đầy đủ thông tin voucher'
      })
    }

    const voucher = new Voucher({
      name,
      description: description || '',
      price,
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
    const { name, description, price, quantity } = req.body

    const updatedVoucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        quantity
      },
      { new: true, runValidators: true }
    )

    if (!updatedVoucher) {
      return res.status(404).json({ message: 'Voucher không tồn tại' })
    }

    res.status(200).json(updatedVoucher)
  } catch (error) {
    console.error("Lỗi khi gọi updateVoucher:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

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
