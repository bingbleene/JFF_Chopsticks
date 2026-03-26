import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import dotenv from 'dotenv'

dotenv.config()


// authorization - xác minh user là ai
export const protectedRoute = async (req, res, next) => {
    try {
        // Log toàn bộ headers để debug
        console.log('--- [DEBUG] Headers:', req.headers);
        // lấy token từ header
        const authHeader = req.header("authorization")
        console.log('--- [DEBUG] Authorization header:', authHeader);
        const token = authHeader && authHeader.split(" ")[1] // bearer token
        console.log('--- [DEBUG] Access token:', token);

        if (!token) {
            console.log('--- [DEBUG] Không tìm thấy access token trong header');
            return res.status(401).json({message: "Access token không tồn tại"})
        }
        // xác nhận token hợp lệ
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                console.log('--- [DEBUG] Lỗi xác thực JWT:', err);
                return res.status(403).json({message: "Token hết hạn hoặc không hợp lệ"})
            }
            // tìm user
            const user = await User.findById(decoded.userId).select("-password") // không trả về password
            if (!user) {
                console.log('--- [DEBUG] Không tìm thấy user với userId:', decoded.userId);
                return res.status(404).json({message: "User không tồn tại"})
            }

            // trả user về trong req để controller dùng tiếp
            req.user = user
            next()
        })
    } catch (error) {
        console.log("Lỗi khi xác minh JWT trong Middleware:", error)
        return res.status(500).json({message: "Lỗi hệ thống"})
    }
}