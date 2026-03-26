import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        sparse: true
    },
    avatarUrl: { 
        type: String, // lưu CDN
    },
    avatarId: {
        type: String // lưu Cloudinary public_id để xóa ảnh khi cần
    }
},
{
    timestamps: true,
});

export default mongoose.model("User", userSchema);