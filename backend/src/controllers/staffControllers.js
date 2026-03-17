import Staff from '../models/Staff.js'

export const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ name: -1 })
    res.status(200).json(staff)
  } catch (error) {
    console.error("Lỗi khi gọi getAllStaff:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const getStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
    if (!staff) {
      return res.status(404).json({ message: 'Nhân viên không tồn tại' })
    }
    res.status(200).json(staff)
  } catch (error) {
    console.error("Lỗi khi gọi getStaff:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const createStaff = async (req, res) => {
  try {
    const { name, number, phone, role } = req.body

    if (!name || !number  ) {
      return res.status(400).json({
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      })
    }

    const existingStaff = await Staff.findOne({ number: number.trim() })
    if (existingStaff) {
      return res.status(400).json({
        message: 'Nhân viên với mã số này đã tồn tại'
      })
    }

    const staff = new Staff({
      name,
      number,
      phone,
      role
    })

    const newStaff = await staff.save()
    res.status(201).json(newStaff)
  } catch (error) {
    console.error("Lỗi khi gọi createStaff:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const updateStaff = async (req, res) => {
  try {
    const allowedFields = ['name', 'number', 'phone', 'role'];

    const updateData = Object.fromEntries(
      Object.entries(req.body)
        .filter(([key, value]) =>
          allowedFields.includes(key) && value !== undefined
        )
    );

    if (typeof updateData.name === "string") {
      updateData.name = updateData.name.trim();
    }

    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedStaff) {
      return res.status(404).json({ message: 'Nhân viên không tồn tại' });
    }

    res.status(200).json(updatedStaff);
  } catch (error) {
    console.error("Lỗi khi gọi updateStaff:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};


export const deleteStaff = async (req, res) => {
  try {
    const deletedStaff = await Staff.findByIdAndDelete(req.params.id)

    if (!deletedStaff) {
      return res.status(404).json({ message: 'Nhân viên không tồn tại' })
    }

    res.status(200).json(deletedStaff)
  } catch (error) {
    console.error("Lỗi khi gọi deleteStaff:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}
