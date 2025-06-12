import axiosInstance from "./config";

class QuestionTypeService {
    static async getAll() {
        try {
            return await axiosInstance.get("/types");
        } catch (error) {
            console.error("Lỗi kết nối đến API", error);
        }
    }
}

export default QuestionTypeService;
