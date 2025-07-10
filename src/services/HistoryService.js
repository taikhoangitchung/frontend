import axiosInstance from "../config/axiosConfig";

class HistoryService {
    static async add(submissionData) {
        try {
            return await axiosInstance.post('/histories', submissionData);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async getAll(page = 0, size = 12) {
        try {
            return await axiosInstance.get("/histories", {
                params: { page, size }
            });
        } catch (error) {
            throw error;
        }
    }

    static async getALlCreateByMe(page = 0, size = 12) {
        try {
            return await axiosInstance.get("/histories/my", {
                params: { page, size }
            });
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

    static async getRoomByHistoryId(id) {
        try {
            return await axiosInstance.get(`/histories/room/${id}`);
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