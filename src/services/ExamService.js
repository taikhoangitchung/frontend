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
            return await axiosInstance.post(`/exams`,params);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async update(params, id) {
        try {
            return await axiosInstance.patch(`/exams/${id}`,params);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static getByCategory(categoryId) {
        return axiosInstance.get(`/exams/categories/${categoryId}/exams`);
    }

    static async getToPlayById(id) {
        try {
            return await axiosInstance.get(`/exams/${id}/play`);
        } catch (error) {
            return Promise.reject(error);
        }
    }
    static async getAll() {
        try {
            return await axiosInstance.get(`/exams`);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async delete(id) {

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
