import Product from '../models/Product.js'
import Import from '../models/Import.js'

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product
    .find()
    .sort({ createdAt: -1 })
    .populate('tag', 'name')

    res.status(200).json(products)
  } catch (error) {
    console.error("Lỗi khi gọi getAllProducts:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const getAllProductWithImport = async (req, res) => {
  try {
    const products = await Product
    .find()
    .sort({ createdAt: -1 })
    .populate('tag', 'name')

    const productsWithImportPrice = await Promise.all(products.map(async (product) => {
      const lastImport = await Import.findOne({
        status: 'active',
        'items.importItemId': product._id
      })
        .sort({ dateImported: -1 })
        .lean()
      let importPrice = null
      if (lastImport) {
        const item = lastImport.items.find(i => i.importItemId.toString() === product._id.toString())
        if (item) importPrice = item.price
      }
      return {
        ...product.toObject(),
        importPrice
      }
    }))
    res.status(200).json(productsWithImportPrice)
  } catch (error) {
    console.error("Lỗi khi gọi getAllProductWithImport:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const getProduct = async (req, res) => {
  try {
    const product = await Product
    .findById(req.params.id)
    .populate('tag', 'name')
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' })
    }
    res.status(200).json(product)

  } catch (error) {
    console.error("Lỗi khi gọi getProduct:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const getProductWithImport = async (req, res) => {
  try {
    const product = await Product
    .findById(req.params.id)
    .populate('tag', 'name')
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' })
    }
    // Lấy importPrice từ phiếu nhập gần nhất
    const lastImport = await Import.findOne({
      status: 'active',
      'items.importItemId': product._id
    })
      .sort({ dateImported: -1 })
      .lean()
    let importPrice = null
    if (lastImport) {
      const item = lastImport.items.find(i => i.importItemId.toString() === product._id.toString())
      if (item) importPrice = item.price
    }
    res.status(200).json({ ...product.toObject(), importPrice })
  } catch (error) {
    console.error("Lỗi khi gọi getProductWithImport:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const createProduct = async (req, res) => {
  try {
    const { name, quantity, unit, description, tag } = req.body

    if (!name  || !tag ) {
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

    // tạo product index từ động PR + mm + yy + xxxx (number)
    const now = new Date();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0'); 
    const yy = now.getFullYear().toString().slice(-2); 
    const prefix = `PR${mm}${yy}`; 

    // Lấy product cuối cùng theo productIndex
    const lastProduct = await Product.findOne({ productIndex: { $regex: `^${prefix}` } }).sort({ productIndex: -1 });
    let index = 1;
    if (lastProduct && lastProduct.productIndex) {
      const lastNumberStr = lastProduct.productIndex.slice(-4);
      index = parseInt(lastNumberStr) + 1;
    }
    const productIndex = `${prefix}${index.toString().padStart(4, '0')}`;


    const product = new Product({
      productIndex,
      name: name.trim(),
      quantity: quantity || 0,
      unit: unit || 'cái',
      description: description || '',
      tag: tag || null
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
    const allowedFields = ['name', 'quantity', 'unit', 'description', 'tag'];

    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(
        ([key, value]) => allowedFields.includes(key) && value !== undefined
      )
    );

    if (updateData.name !== undefined) {
      if (typeof updateData.name !== "string") {
        return res.status(400).json({ message: "Tên sản phẩm không hợp lệ" });
      }

      const trimmedName = updateData.name.trim();

      const existingProduct = await Product.findOne({
        name: trimmedName,
        _id: { $ne: req.params.id }
      });

      if (existingProduct) {
        return res.status(400).json({
          message: 'Sản phẩm với tên này đã tồn tại'
        });
      }

      updateData.name = trimmedName;
    }

    if (updateData.quantity !== undefined && updateData.quantity < 0) {
      return res.status(400).json({ message: "Số lượng không hợp lệ" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Lỗi khi gọi updateProduct:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

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
