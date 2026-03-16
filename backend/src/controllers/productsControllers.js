import Product from '../models/Product.js'

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    res.status(200).json(products)
  } catch (error) {
    console.error("Lỗi khi gọi getAllProducts:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' })
    }
    res.status(200).json(product)
  } catch (error) {
    console.error("Lỗi khi gọi getProduct:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const createProduct = async (req, res) => {
  try {
    const { name, quantity, importPrice, unit, description, tags } = req.body

    if (!name || quantity === undefined || !importPrice || !tags ) {
      return res.status(400).json({
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      })
    }

    const existingProduct = await Product.findOne({ name: name.trim() })
    if (existingProduct) {
      return res.status(400).json({
        message: 'Sản phẩm với tên này đã tồn tại'
      })
    }

    const product = new Product({
      name,
      quantity,
      importPrice,
      unit: unit || 'cái',
      description: description || '',
      tags: tags || []
    })

    const newProduct = await product.save()
    res.status(201).json(newProduct)
  } catch (error) {
    console.error("Lỗi khi gọi createProduct:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const { name, quantity, importPrice, unit, description, tags } = req.body

    if (name) {
      const existingProduct = await Product.findOne({
        name: name.trim(),
        _id: { $ne: req.params.id }
      })
      if (existingProduct) {
        return res.status(400).json({
          message: 'Sản phẩm với tên này đã tồn tại'
        })
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        quantity,
        importPrice,
        unit,
        description,
        tags
      },
      { new: true, runValidators: true }
    )

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' })
    }

    res.status(200).json(updatedProduct)
  } catch (error) {
    console.error("Lỗi khi gọi updateProduct:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id)

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' })
    }

    res.status(200).json(deletedProduct)
  } catch (error) {
    console.error("Lỗi khi gọi deleteProduct:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}
