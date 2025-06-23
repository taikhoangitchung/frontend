import axiosInstance from "../config/axiosConfig";

class TypeService {
    static async getAll() {
        try {
            return await axiosInstance.get("/types");
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export default TypeService;
