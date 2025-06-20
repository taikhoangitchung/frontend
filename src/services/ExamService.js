import axiosInstance from "../services/config";

class ExamService {
    static async exist(title) {
        try {
            return await axiosInstance.get(`/exams/is-exists/${title}`);
        } catch (error) {
            return error;
        }
    }

    static async create(params) {
        try {
            return await axiosInstance.post(`/exams`,params);
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
    static async getAllMine() {
        try {
            return await axiosInstance.get(`/exams`);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async delete(id) {

    }
}

export default ExamService;
