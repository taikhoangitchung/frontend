import axiosInstance from "@/services/axiosConfig";

class CategoryService {
    static async getAll() {
        try {
            return await axiosInstance.get("/categories");
        } catch (error) {
            console.error("Lỗi kết nối đến API", error);
        }
    }
}

export default CategoryService;
