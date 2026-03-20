import Import from "../models/Import.js";
import Product from "../models/Product.js";
import Staff from "../models/Staff.js";

export const getAllImports = async (req, res) => {
    try {
        const imports = await Import.find()
            .populate("staff", "name")
            .populate("items.importItemId", "name unit")
            .populate("tag", "name")
            .sort({ dateImported: -1 });
        res.status(200).json(imports);
    } catch (error) {
        console.error("Lỗi khi gọi getAllImports:", error);
        res.status(500).json({message: "Lỗi hệ thống"});

    }
}

export const getImport = async (req, res) => {
    try {
        const importRecord = await Import.findById(req.params.id)
            .populate("staff", "name")
            .populate("items.importItemId", "name unit")
            .populate("tag", "name");
        if (!importRecord) {
            return res.status(404).json({message: 'Phiếu nhập không tồn tại'});
        }
        res.status(200).json(importRecord);
    } catch (error) {
        console.error("Lỗi khi gọi getImport:", error);
        res.status(500).json({message: "Lỗi hệ thống"});
    }
}

export const getImportForProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const imports = await Import.find({
      status: 'active',
      'items.importItemId': productId
    })
      .populate("staff", "name")
      .populate("items.importItemId", "name unit")
      .sort({ dateImported: -1 });
    res.status(200).json(imports);
  } catch (error) {
    console.error("Lỗi khi gọi getImportForProduct:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
}

export const createImport = async (req, res) => {
    try {
        const {items, staff, note, tag, dateImported} = req.body;
        // Tự động tạo importIndex 
        const now = new Date()
    
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const year = now.getFullYear().toString().slice(-2)
    
        const monthYear = `${month}${year}`
    
        // tìm hóa đơn gần nhất trong tháng
        const lastImport = await Import.findOne({
            importIndex: new RegExp(`^PN${monthYear}`)
        }).sort({ createdAt: -1 })
    
        let nextNumber = 1
    
        if (lastImport) {
            const lastNumber = parseInt(lastImport.importIndex.split(`${monthYear}`)[1]);
            nextNumber = lastNumber + 1
        }
    
        const formattedNumber = String(nextNumber).padStart(4, '0')
    
        const importIndex = `PN${monthYear}${formattedNumber}`
    
        
        if (!items || items.length === 0 || !staff) {
            return res.status(400).json({message: 'Vui lòng điền đầy đủ thông tin bắt buộc (importIndex, items, staff)'});
        }
        const existingImport = await Import.findOne({importIndex: importIndex.trim()});
        if (existingImport) {
            return res.status(400).json({message: 'Mã phiếu nhập đã tồn tại'});
        }
        const staffExists = await Staff.findById(staff);
        if (!staffExists) {
            return res.status(400).json({message: 'Nhân viên không tồn tại'});
        }
        for (const item of items) {
            if (!item.importItemId || item.quantity === undefined || item.price === undefined) {
                return res.status(400).json({message: 'Mỗi sản phẩm phải có importItemId, quantity và price'});
            }
            if (item.quantity < 1) {
                return res.status(400).json({message: 'Số lượng phải lớn hơn hoặc bằng 1'});
            }
            if (item.price < 0) {
                return res.status(400).json({message: 'Giá phải là số dương'});
            }
        }

        // cập nhật số lượng sản phẩm trong kho
        for (const item of items) {
            const product = await Product.findById(item.importItemId);
            if (product) {
                product.quantity += item.quantity;
                await product.save();
            }
        }

        const newImport = new Import({
            importIndex: importIndex.trim(),
            items,
            staff,
            note: note || '',
            tag: tag || '',
            dateImported: dateImported ?? Date.now()

        });
        const savedImport = await newImport.save();
        const populatedImport = await Import.findById(savedImport._id)
            .populate("staff", "name")
            .populate("items.importItemId", "name unit");
        res.status(201).json(populatedImport);
    } catch (error) {
        console.error("Lỗi khi gọi createImport:", error);
        res.status(500).json({message: "Lỗi hệ thống"});
    }
}

export const updateImport = async (req, res) => {
  try {
    const allowedFields = [
      'items',
      'staff',
      'note',
      'tag'
    ];

    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(
        ([key, value]) => allowedFields.includes(key) && value !== undefined
      )
    );

    const updatedImport = await Import.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("staff", "name")
      .populate("items.importItemId", "name unit");

    if (!updatedImport) {
      return res.status(404).json({ message: 'Phiếu nhập không tồn tại' });
    }

    res.status(200).json(updatedImport);

  } catch (error) {
    console.error("Lỗi khi gọi updateImport:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
}

export const cancelImport = async (req, res) => {
    try {
        const { cancelReason } = req.body;
        if (!cancelReason || cancelReason.trim() === "") {
            return res.status(400).json({ message: "Vui lòng nhập lý do hủy phiếu nhập" });
        }
        const cancelImport = await Import.findById(req.params.id);
        if (!cancelImport) {
            return res.status(404).json({ message: 'Phiếu nhập không tồn tại' });
        }
        if (cancelImport.status === 'cancelled') {
            return res.status(400).json({ message: "Phiếu nhập đã bị hủy trước đó" });
        }

        // Hoàn lại số lượng sản phẩm trong kho
        for (const item of cancelImport.items) {
            const product = await Product.findById(item.importItemId);
            if (product) {
                product.quantity -= item.quantity;
                if (product.quantity < 0) {
                    product.quantity = 0; // Đảm bảo số lượng không âm
                }
                await product.save();
            }
        }

        cancelImport.status = 'cancelled';
        cancelImport.note = cancelImport.note
            ? `${cancelImport.note}\n[Lý do hủy]: ${cancelReason}`
            : `[Lý do hủy]: ${cancelReason}`;
        await cancelImport.save();
        res.status(200).json(cancelImport);
    } catch (error) {
        console.error("Lỗi khi gọi cancelImport:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
}

export const deleteImport = async (req, res) => {
  try {
    const deletedImport = await Import.findByIdAndDelete(req.params.id)
      .populate("staff", "name")
      .populate("items.importItemId", "name unit");
    if (!deletedImport) {
      return res.status(404).json({ message: 'Phiếu nhập không tồn tại' });
    }
    
    if (deletedImport.status !== 'cancelled') {
      for (const item of deletedImport.items) {
        const product = await Product.findById(item.importItemId);
        if (product) {
          product.quantity -= item.quantity;
          await product.save();
        }
      }
    }

    res.status(200).json(deletedImport);
  } catch (error) {
    console.error("Lỗi khi gọi deleteImport:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
}
