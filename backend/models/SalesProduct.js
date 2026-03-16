import mongoose from 'mongoose'

const salesProductSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      required: [true, 'ID sản phẩm là bắt buộc']
    },
    name: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc']
    },
    saleType: {
      type: String,
      enum: ['retail', 'combo'],
      default: 'retail'
    },
    originalPrice: {
      type: Number,
      required: [true, 'Giá gốc là bắt buộc'],
      min: [0, 'Giá không được âm']
    },
    customPrice: {
      type: Number,
      default: null,
      min: [0, 'Giá không được âm']
    },
    quantity: {
      type: Number,
      default: 1,
      min: [0, 'Số lượng không được âm']
    }
  },
  { timestamps: true }
)

export default mongoose.model('SalesProduct', salesProductSchema)
