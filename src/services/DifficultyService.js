import axiosInstance from "../config/axiosConfig";

class DifficultyService {
    static async getAll() {
        try {
            return await axiosInstance.get("/difficulties");
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export default DifficultyService;
