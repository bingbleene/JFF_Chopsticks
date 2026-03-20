import mongoose from 'mongoose'

const voucherSchema = new mongoose.Schema(
  {
      voucherIndex: {
        type: String,
        required: true,
        unique: true
      },  
      name: {
        type: String,
        required: [true, 'Tên voucher là bắt buộc'],
        trim: true
      },
      description: {
        type: String,
        default: ''
      },
      type: {
        type: String,
        enum: ['percentage', 'fixed', 'original_price'],
        required: [true, 'Loại voucher là bắt buộc']
       },
      value: {
        type: Number,
        min: 0,
        required: function () {
          return this.type !== 'original_price';
        }
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