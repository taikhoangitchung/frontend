import axiosInstance from "../services/config";

class HistoryService {
    static async add(submissionData) {
        try {
            return await axiosInstance.post('/histories', submissionData);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async getHistory() {
        try {
            return await axiosInstance.get("/histories");
        } catch (error) {
            throw error;
        }
    }

    static async getHistoryDetail(id) {
        try {
            return await axiosInstance.get(`/histories/${id}`);
        } catch (error) {
            throw error;
        }
    }

    static async getByExamId(id) {
        try {
            return await axiosInstance.get(`/histories/exams/${id}`);
        } catch (error) {
            throw error;
        }
    }
}

export default HistoryService;