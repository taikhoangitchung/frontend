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
}
export default ExamService;
