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
            console.error("Lỗi khi lấy lịch sử bài thi:", error);
            throw error;
        }
    }

    static async getHistoryDetail(id) {
        try {
            return await axiosInstance.get(`/histories/${id}`);
        } catch (error) {
            console.error(`Lỗi khi lấy chi tiết bài thi với id ${id}:`, error);
            throw error;
        }
    }
}

export default HistoryService;