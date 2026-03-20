import Tag from "../models/Tag.js";

export const getAllTags = async (req, res) => {
    try {
        const tags = await Tag.find().sort({ createdAt: -1 })
        res.status(200).json(tags)
    } catch (error) {
        console.error("Lỗi khi gọi getAllTags:", error);
        res.status(500).json({ message: "Lỗi hệ thống" })
    }
}

export const getTag = async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.id)
        if (!tag) {
            return res.status(404).json({ message: 'Tag không tồn tại' })
        }
        res.status(200).json(tag)
    } catch (error) {
        console.error("Lỗi khi gọi getTag:", error);
        res.status(500).json({ message: "Lỗi hệ thống" })
    }
}

export const createTag = async (req, res) => {
    try {
        const { name, description } = req.body
        if (!name) {
            return res.status(400).json({ message: 'Vui lòng điền tên tag' })
        }
        const existingTag = await Tag.findOne({ name: name.trim() })
        if (existingTag) {
            return res.status(400).json({ message: 'Tag với tên này đã tồn tại' })
        }

        // tạo tag index từ động TA + mm + yy + xxxx (number)
        const now = new Date();
        const mm = (now.getMonth() + 1).toString().padStart(2, '0'); 
        const yy = now.getFullYear().toString().slice(-2); 
        const prefix = `TA${mm}${yy}`; 

        // Sửa đúng trường tagIndex và retry nếu bị duplicate
        let index = 1;
        let tagIndex = '';
        let newTag = null;
        let tryCount = 0;
        const maxTry = 10;
        while (tryCount < maxTry) {
            // Lấy tag cuối cùng theo tagIndex
            const lastTag = await Tag.findOne({ tagIndex: { $regex: `^${prefix}` } }).sort({ tagIndex: -1 });
            if (lastTag && lastTag.tagIndex) {
                const lastNumberStr = lastTag.tagIndex.slice(-4);
                index = parseInt(lastNumberStr) + 1;
            } else {
                index = 1;
            }
            tagIndex = `${prefix}${index.toString().padStart(4, '0')}`;
            try {
                const tag = new Tag({ tagIndex, name, description })
                newTag = await tag.save()
                break;
            } catch (err) {
                if (err.code === 11000 && err.keyPattern && err.keyPattern.tagIndex) {
                    // Duplicate, thử lại với số tiếp theo
                    index++;
                    tryCount++;
                    continue;
                } else {
                    throw err;
                }
            }
        }
        if (!newTag) {
            return res.status(500).json({ message: 'Không thể tạo tag mới, vui lòng thử lại.' })
        }
        res.status(201).json(newTag)
    } catch (error) {
        console.error("Lỗi khi gọi createTag:", error);
        res.status(500).json({ message: "Lỗi hệ thống" })
    }
}

export const updateTag = async (req, res) => {
    try {
        const allowedFields = ['name', 'description'];

        const updateData = Object.fromEntries(
            Object.entries(req.body)
        .filter(([key, value]) => allowedFields.includes(key) && value !== undefined)
        .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
        );

        if (updateData.name) {
            const existingTag = await Tag.findOne({ name: updateData.name, _id: { $ne: req.params.id } })
            if (existingTag) {
                return res.status(400).json({ message: 'Tag với tên này đã tồn tại' })
            }
        }

        const tag = await Tag.findById(req.params.id)
        if (!tag) {
            return res.status(404).json({ message: 'Tag không tồn tại' })
        }

        const updatedTag = await tag.save()
        res.status(200).json(updatedTag)
    } catch (error) {
        console.error("Lỗi khi gọi updateTag:", error);
        res.status(500).json({ message: "Lỗi hệ thống" })
    }
}

export const deleteTag = async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.id)
        if (!tag) {
            return res.status(404).json({ message: 'Tag không tồn tại' })
        }
        await Tag.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: 'Xóa tag thành công' })
    } catch (error) {
        console.error("Lỗi khi gọi deleteTag:", error);
        res.status(500).json({ message: "Lỗi hệ thống" })
    }
}