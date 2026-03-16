import mongoose from 'mongoose'

const saleProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    saleType: {
      type: String,
      enum: ['retail', 'combo'],
      required: [true, 'Loại bán hàng là bắt buộc']
    },
    price: {
      type: Number,
      required: [true, 'Giá sản phẩm là bắt buộc'],
      min: [0, 'Giá không được âm']
    },
    quantity: {
      type: Number,
      default: 1,
      min: [0, 'Số lượng không được âm']
    },
    tags: {
      type: [String],
      default: []
    },
    // items: chứa danh sách sản phẩm từ Product
    // - retail: chỉ có 1 item duy nhất
    // - combo: có >= 1 items (nhiều sản phẩm)
    items: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, 'ID sản phẩm là bắt buộc']
          },
          quantity: {
            type: Number,
            required: true,
            min: [1, 'Số lượng phải ≥ 1']
          }
        }
      ],
      required: [true, 'Danh sách sản phẩm là bắt buộc'],
      validate: {
        validator: function(items) {
          if (!items || items.length === 0) return false
          // retail: chỉ có 1 item
          if (this.saleType === 'retail' && items.length !== 1) return false
          // combo: có ít nhất 1 item
          if (this.saleType === 'combo' && items.length < 1) return false
          return true
        },
        message: function() {
          if (this.saleType === 'retail') {
            return 'Sản phẩm bán lẻ phải có đúng 1 sản phẩm'
          }
          return 'Combo phải có ít nhất 1 sản phẩm'
        }
      }
    }
  },
  { timestamps: true }
)

export default mongoose.model('SaleProduct', saleProductSchema)
