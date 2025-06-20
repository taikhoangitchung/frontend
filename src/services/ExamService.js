import axiosInstance from "../services/config";

class ExamService {
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
