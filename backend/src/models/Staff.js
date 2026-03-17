import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
{
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