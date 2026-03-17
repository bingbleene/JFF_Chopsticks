import mongoose from "mongoose";

const importSchema = new mongoose.Schema(
{
    importIndex: {
        type: String,
        required: true,
        unique: true
    },
    dateImported: {
        type: Date,
        default: Date.now
    },
    items: {
          type: [
            {
              importItemId: {
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
          required: [true, 'Danh sách sản phẩm là bắt buộc']
        },
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        required: true
    },
    note: {
        type: String,
        default: ""
    },
    tag: {
        type: String,
        default: ""
    }
},
    
    { timestamps: true }
)

export default mongoose.model("Import", importSchema);