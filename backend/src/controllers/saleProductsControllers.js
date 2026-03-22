import SaleProduct from "../models/saleProduct.js"
import Import from "../models/Import.js"

export const getAllSaleProducts = async (req, res) => {
  try {
    const { saleType } = req.query

    const query = saleType ? { saleType } : {}

    const saleProducts = await SaleProduct
      .find(query)
      .populate("items.productId", "name quantity unit")
      .populate("tags", "name")
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
      .populate("items.productId", "name quantity unit")
      .populate("tags", "name")
    if (!saleProduct) {
      return res.status(404).json({ message: 'Sản phẩm bán không tồn tại' })
    }
    res.status(200).json(saleProduct)
  } catch (error) {
    console.error("Lỗi khi gọi getSaleProduct:", error);
    res.status(500).json({ message: "Lỗi hệ thống" })
  }
}


export const buildItemsWithImportPrice = async (items) => {
  const productIds = items.map(i => i.productId.toString());

  const imports = await Import.find({
    "items.importItemId": { $in: productIds },
    status: "active"
  }).sort({ dateImported: -1 }); 

  const newItems = [];

  for (const item of items) {
    const productId = item.productId.toString();

    const matchedImport = imports.find(imp =>
      imp.items.some(i => i.importItemId.toString() === productId)
    );

    if (!matchedImport) {
      return { error: "Không tìm thấy giá nhập cho sản phẩm" };
    }

    const importItem = matchedImport.items.find(
      i => i.importItemId.toString() === productId
    );

    if (!importItem) {
      return { error: "Không tìm thấy item trong phiếu nhập" };
    }

    newItems.push({
      productId: item.productId,
      quantity: item.quantity,
      importPrice: importItem.price
    });
  }

  return { data: newItems };
};

export const createSaleProduct = async (req, res) => {
  try {
    const { name, description, price, items, saleType, tags, quantity } = req.body;

    // 🔥 Validate
    if (!name || price === undefined || !items || items.length === 0 || !saleType) {
      return res.status(400).json({
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc (name, price, saleType, items)'
      });
    }

    if (!['retail', 'combo'].includes(saleType)) {
      return res.status(400).json({
        message: 'Loại bán hàng không hợp lệ'
      });
    }

    if (saleType === 'retail' && items.length !== 1) {
      return res.status(400).json({
        message: 'Sản phẩm bán lẻ chỉ được có 1 sản phẩm'
      });
    }

    if (saleType === 'combo' && items.length < 1) {
      return res.status(400).json({
        message: 'Combo phải có ít nhất 1 sản phẩm'
      });
    }

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          message: 'Mỗi sản phẩm phải có productId và số lượng >= 1'
        });
      }
    }

    const result = await buildItemsWithImportPrice(items);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    const now = new Date();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const yy = now.getFullYear().toString().slice(-2);
    const prefix = `SP${mm}${yy}`;

    let index = 1;
    let saleProductIndex = '';
    let newSaleProduct = null;
    let tryCount = 0;
    const maxTry = 10;

    while (tryCount < maxTry) {
      const last = await SaleProduct
        .findOne({ saleProductIndex: { $regex: `^${prefix}` } })
        .sort({ saleProductIndex: -1 });

      if (last?.saleProductIndex) {
        const num = parseInt(last.saleProductIndex.slice(-4));
        index = num + 1;
      } else {
        index = 1;
      }

      saleProductIndex = `${prefix}${index.toString().padStart(4, '0')}`;

      try {
        const sp = new SaleProduct({
          saleProductIndex,
          name: name.trim(),
          description: description || '',
          price,
          items: result.data,
          saleType,
          tags: Array.isArray(tags) ? tags : [],
          quantity: quantity || 1
        });

        newSaleProduct = await sp.save();
        break;

      } catch (err) {
        if (err.code === 11000 && err.keyPattern?.saleProductIndex) {
          index++;
          tryCount++;
          continue;
        } else {
          throw err;
        }
      }
    }

    if (!newSaleProduct) {
      return res.status(500).json({
        message: 'Không thể tạo sản phẩm bán mới'
      });
    }

    const populatedProduct = await SaleProduct.findById(newSaleProduct._id)
      .populate("items.productId", "name quantity unit")
      .populate("tags", "name");

    res.status(201).json(populatedProduct);

  } catch (error) {
    console.error("Lỗi khi gọi createSaleProduct:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateSaleProduct = async (req, res) => {
  try {
    const { items, saleType } = req.body;

    const existing = await SaleProduct.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Sản phẩm bán không tồn tại' });
    }

    const finalItems = items ?? existing.items;
    const finalSaleType = saleType ?? existing.saleType;

    if (finalSaleType === 'retail' && finalItems.length !== 1) {
      return res.status(400).json({
        message: 'Sản phẩm bán lẻ phải có đúng 1 sản phẩm'
      });
    }

    if (finalSaleType === 'combo' && finalItems.length < 1) {
      return res.status(400).json({
        message: 'Combo phải có ít nhất 1 sản phẩm'
      });
    }

    if (items !== undefined) {
      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity < 1) {
          return res.status(400).json({
            message: 'Mỗi sản phẩm phải có productId và số lượng >= 1'
          });
        }
      }
    }

    const allowedFields = [
      'name',
      'description',
      'price',
      'saleType',
      'tags',
      'quantity'
    ];

    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(
        ([key, value]) => allowedFields.includes(key) && value !== undefined
      )
    );

    if (updateData.name) {
      updateData.name = updateData.name.trim();
    }

    if (items !== undefined) {
      const result = await buildItemsWithImportPrice(items);

      if (result.error) {
        return res.status(400).json({ message: result.error });
      }

      updateData.items = result.data;
    }

    const updatedSaleProduct = await SaleProduct.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("items.productId", "name quantity unit");

    res.status(200).json(updatedSaleProduct);

  } catch (error) {
    console.error("Lỗi khi gọi updateSaleProduct:", error);
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
