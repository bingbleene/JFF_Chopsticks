import mongoose, { trusted } from  'mongoose'

const tagSchema = new mongoose.Schema(
    {
        tagIndex: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: ""
        },
    },
    { timestamps: true }
)

export default mongoose.model("Tag", tagSchema)