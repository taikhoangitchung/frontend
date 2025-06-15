import axiosInstance from "../services/config";

class CategoryService {
    static async getAll() {
        try {
            return await axiosInstance.get("/categories");
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async delete(id) {
        try {
            return await axiosInstance.delete(`/categories/${id}`);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async getById(id) {
        try {
            return await axiosInstance.get(`/categories/${id}`);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async update(id, form) {
        try {
            return await axiosInstance.put(`/categories/${id}`, form);
        } catch (error) {
            return Promise.reject(error);
        }
    }
    static async create(form) {
        try {
            return await axiosInstance.post("/categories", form);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export default CategoryService;
