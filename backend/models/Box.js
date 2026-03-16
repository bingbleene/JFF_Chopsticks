import mongoose from 'mongoose'

const boxSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên combo là bắt buộc'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'Giá combo là bắt buộc'],
      min: [0, 'Giá không được âm']
    },
    items: {
      type: [
        {
          productId: {
            type: Number,
            required: true
          },
          quantity: {
            type: Number,
            required: true,
            min: [1, 'Số lượng phải ≥ 1']
          }
        }
      ],
      default: []
    }
  },
  { timestamps: true }
)

export default mongoose.model('Box', boxSchema)
