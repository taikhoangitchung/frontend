import axiosInstance from "./config";

class ExamService {
    static async getUserHistory(userId, page = 0, size = 20, token) {
        try {
            return await axiosInstance.get(`/exams/history/user/${userId}`, {
                params: { page, size },
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error("Lỗi khi lấy lịch sử thi:", error);
            throw error;
        }
    }

    static async getExamHistoryDetail(userId, examId, token) {
        try {
            return await axiosInstance.get(`/exams/history/${examId}/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết lịch sử thi:", error);
            throw error;
        }
    }
}

export default ExamService;