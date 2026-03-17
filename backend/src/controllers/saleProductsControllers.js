import SaleProduct from "../models/saleProduct.js"

export const getAllSaleProducts = async (req, res) => {
  try {
    const { saleType } = req.query

    const query = saleType ? { saleType } : {}

    const saleProducts = await SaleProduct
      .find(query)
      .populate("items.productId", "name importPrice quantity unit")
      .sort({ createdAt: -1 })
    res.status(200).json(saleProducts)
  } catch (error) {
    console.error("Lỗi khi gọi getAllSaleProducts:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const getSaleProduct = async (req, res) => {
  try {
    const saleProduct = await SaleProduct.findById(req.params.id)
      .populate("items.productId", "name importPrice quantity unit")
    if (!saleProduct) {
      return res.status(404).json({ message: 'Sản phẩm bán không tồn tại' })
    }
    res.status(200).json(saleProduct)
  } catch (error) {
    console.error("Lỗi khi gọi getSaleProduct:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const createSaleProduct = async (req, res) => {
  try {
    const { name, description, price, items, saleType, tags, quantity } = req.body

    // Validate required fields
    if (!name || price === undefined || !items || items.length === 0 || !saleType) {
      return res.status(400).json({
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc (tên, giá, loại bán, sản phẩm)'
      })
    }

    // Validate saleType specific rules
    if (saleType === 'retail') {
      if (items.length !== 1) {
        return res.status(400).json({
          message: 'Sản phẩm bán lẻ (retail) chỉ được có 1 sản phẩm duy nhất'
        })
      }
    } else if (saleType === 'combo') {
      if (items.length < 1) {
        return res.status(400).json({
          message: 'Combo phải có ít nhất 1 sản phẩm'
        })
      }
    } else {
      return res.status(400).json({
        message: 'Loại bán hàng không hợp lệ. Chỉ chấp nhận: retail hoặc combo'
      })
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          message: 'Mỗi sản phẩm phải có productId và số lượng >= 1'
        })
      }
    }

    const saleProduct = new SaleProduct({
      name: name.trim(),
      description: description || '',
      price,
      items,
      saleType,
      tags: tags || [],
      quantity: quantity || 1
    })

    const newSaleProduct = await saleProduct.save()

    // Populate before returning
    const populatedProduct = await SaleProduct.findById(newSaleProduct._id)
      .populate("items.productId", "name importPrice quantity unit")

    res.status(201).json(populatedProduct)
  } catch (error) {
    console.error("Lỗi khi gọi createSaleProduct:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message })
    }
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const updateSaleProduct = async (req, res) => {
  try {
    const { name, description, price, items, saleType, tags, quantity } = req.body

    // Validate saleType specific rules if provided
    if (saleType && items) {
      if (saleType === 'retail' && items.length !== 1) {
        return res.status(400).json({
          message: 'Sản phẩm bán lẻ (retail) chỉ được có 1 sản phẩm duy nhất'
        })
      }
      if (saleType === 'combo' && items.length < 1) {
        return res.status(400).json({
          message: 'Combo phải có ít nhất 1 sản phẩm'
        })
      }
    }

    // Validate each item if provided
    if (items) {
      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity < 1) {
          return res.status(400).json({
            message: 'Mỗi sản phẩm phải có productId và số lượng >= 1'
          })
        }
      }
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (items !== undefined) updateData.items = items;
    if (saleType !== undefined) updateData.saleType = saleType;
    if (tags !== undefined) updateData.tags = tags;
    if (quantity !== undefined) updateData.quantity = quantity;

    const updatedSaleProduct = await SaleProduct.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("items.productId", "name importPrice quantity unit");

    if (!updatedSaleProduct) {
      return res.status(404).json({ message: 'Sản phẩm bán không tồn tại' });
    }

    res.status(200).json(updatedSaleProduct);

  } catch (error) {
    console.error("Lỗi khi gọi updateSaleProduct:", error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const deleteSaleProduct = async (req, res) => {
  try {
    const deletedSaleProduct = await SaleProduct.findByIdAndDelete(req.params.id)

    if (!deletedSaleProduct) {
      return res.status(404).json({ message: 'Sản phẩm bán không tồn tại' })
    }

    res.status(200).json(deletedSaleProduct)
  } catch (error) {
    console.error("Lỗi khi gọi deleteSaleProduct:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}
