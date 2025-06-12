import axiosInstance from "./config";

class DifficultyService {
    static async getAll() {
        try {
            return await axiosInstance.get("/difficulties");
        } catch (error) {
            console.error("Lỗi kết nối đến API", error);
        }
    }
}

export default DifficultyService;
