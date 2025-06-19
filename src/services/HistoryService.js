import axiosInstance from "../services/config";

class HistoryService {
    static async add(submissionData) {
        try {
            return await axiosInstance.post('/histories', submissionData);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export default HistoryService;
