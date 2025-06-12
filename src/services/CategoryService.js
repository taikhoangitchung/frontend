import axiosInstance from "../services/config";

class CategoryService {
    static async getAll() {
        try {
            return await axiosInstance.get("/categories");
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export default CategoryService;
