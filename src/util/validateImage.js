import {toast} from "sonner"

export const validateImage = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    const maxSize =  1024 // 1MB
    if (!validTypes.includes(file.type)) {
        toast.error("Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.")
        return false
    }

    if (file.size > maxSize) {
        toast.error("Kích thước ảnh tối đa là 1MB.")
        return false
    }

    return true
}
