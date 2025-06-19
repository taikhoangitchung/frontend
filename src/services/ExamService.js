import axiosInstance from "../services/config";

class ExamService {
    static async getToPlayById(id) {
        try {
            return await axiosInstance.get(`/exams/${id}/play`);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export default ExamService;
