import mongoose from 'mongoose'

const voucherSchema = new mongoose.Schema(
  {
      name: {
        type: String,
        required: [true, 'Tên voucher là bắt buộc'],
        trim: true
      },
      description: {
        type: String,
        default: ''
      },
      price: {
        type: Number,
        required: [true, 'Giá voucher là bắt buộc'],
        min: [0, 'Giá không được âm']
      },
      quantity: {
        type: Number,
        default: 1,
        min: [0, 'Số lượng không được âm']
      },
      useCount: {
        type: Number,
        default: 0,
        min: [0, 'Số lần sử dụng không được âm và không được vượt quá quantity']
      },
      active: {
        type: Boolean,
        default: true
      }
    },
    { timestamps: true }
  )
  
  export default mongoose.model('Voucher', voucherSchema)