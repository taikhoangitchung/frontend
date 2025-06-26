import axiosInstance from "../config/axiosConfig";

class HistoryService {
    static async add(submissionData) {
        try {
            return await axiosInstance.post('/histories', submissionData);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async getAll() {
        try {
            return await axiosInstance.get("/histories");
        } catch (error) {
            throw error;
        }
    }

    static async getSummaryByExamId(examId) {
        try {
            return await axiosInstance.get(`/histories/exams/${examId}`);
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

    static async getRankByRoomCode(code) {
        try {
            return await axiosInstance.get(`/histories/${code}/rank`);
        } catch (error) {
            throw error;
        }
    }
}

export default HistoryService;