import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
{
  invoiceIndex: {
    type: String,
    required: true,
    unique: true
  },
  dateBought: {
    type: Date,
    default: Date.now
  },
  items: [
    {
      saleItemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "SaleProduct"
      },

      quantity: {
        type: Number,
        required: true,
        min: 1
      }
    }
  ],
  staff: {
    type: String,
    required: true
  },

  customer: {
    type: String,
    default: "Khách lẻ"
  },

  paymentMethod: {
    type: String,
    enum: ["momo", "ngan hang", "tien mat"],
    default: "tien mat"
  },
  vouchers: [
    {
      voucherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Voucher"
      },
      quantity: {
        type: Number,
        min: 1
      }
    }
  ],
  note: {
    type: String,
    default: ""
  }
},
{ timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);