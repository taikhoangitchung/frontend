import axiosInstance from "../config/axiosConfig";

class CategoryService {
    static async getAll(page = 0, size = 20, searchTerm = '') {
        try {
            return await axiosInstance.get("/categories", {
                params: {
                    page,
                    size,
                    searchTerm
                }
            });
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