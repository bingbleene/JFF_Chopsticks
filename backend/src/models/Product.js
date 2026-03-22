import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    productIndex: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Số lượng là bắt buộc'],
      min: [0, 'Số lượng không được âm'],
      default: 0
    },
    unit: {
      type: String,
      default: 'cái',
      enum: ['cái']
    },
    description: {
      type: String,
      default: ''
    },
    tag: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag',
      default: null
    }],
  },
  { timestamps: true }
)

export default mongoose.model('Product', productSchema)
