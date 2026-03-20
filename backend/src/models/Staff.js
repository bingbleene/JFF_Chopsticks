import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
{
    staffIndex: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String
    },
    number: {
        type: String
    },
    phone: {
        type: String
    },
}
)

export default mongoose.model("Staff", staffSchema);