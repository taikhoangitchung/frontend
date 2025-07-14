import axiosInstance from "../config/axiosConfig";

class ExamService {
    static async findById(id) {
        try {
            return await axiosInstance.get(`/exams/${id}`);
        } catch (error) {
            throw error;
        }
    }

    static async exist(title) {
        try {
            return await axiosInstance.get(`/exams/is-exists/${title}`);
        } catch (error) {
            throw error;
        }
    }

    static async create(params) {
        try {
            return await axiosInstance.post(`/exams`, params);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async update(params, id) {
        try {
            return await axiosInstance.patch(`/exams/${id}`, params);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static getByCategory(categoryId) {
        return axiosInstance.get(`/exams/categories/${categoryId}`);
    }

    static async getToPlayById(id) {
        try {
            return await axiosInstance.get(`/exams/${id}/play`);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async getAll(page = 0, size = 10, categoryId = null, searchTerm = '', ownerFilter = 'all', currentUserId = null) {
        try {
            return await axiosInstance.get("/exams", {
                params: {
                    page,
                    size,
                    categoryId: categoryId === "all" ? null : categoryId,
                    searchTerm,
                    ownerFilter,
                    currentUserId // Thêm currentUserId vào params
                }
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async delete(id) {
        try {
            return await axiosInstance.delete(`/exams/${id}`);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async getToPlayByRoomCode(code) {
        try {
            return await axiosInstance.get(`/exams/rooms/${code}/play`);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export default ExamService;