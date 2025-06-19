import axiosInstance from "./config";

class HistoryService {
    static async getHistory(page = 0, size = 20) {
        try {
            return await axiosInstance.get("/histories", {
                params: { page, size },
            });
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