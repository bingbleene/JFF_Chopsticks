import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Số lượng là bắt buộc'],
      min: [0, 'Số lượng không được âm']
    },
    importPrice: {
      type: Number,
      required: [true, 'Giá nhập là bắt buộc'],
      min: [0, 'Giá nhập không được âm']
    },
    salePrice: {
      type: Number,
      required: [true, 'Giá bán là bắt buộc'],
      min: [0, 'Giá bán không được âm']
    },
    unit: {
      type: String,
      default: 'cái',
      enum: ['cái', 'hộp', 'kg', 'lít', 'gói']
    },
    description: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
)

export default mongoose.model('Product', productSchema)
