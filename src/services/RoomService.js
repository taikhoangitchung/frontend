import axiosInstance from "../config/axiosConfig";

class RoomService {
    static async create(id) {
        try {
            return await axiosInstance.post("/rooms", {
                examId: id,
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async join(code) {
        try {
            return await axiosInstance.patch(`/rooms/${code}/join`)
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async check(code) {
        try {
            return await axiosInstance.get(`/rooms/${code}/check`)
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async start(code) {
        try {
            return await axiosInstance.patch(`/rooms/${code}/start`)
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async leave(code) {
        try {
            return await axiosInstance.patch(`/rooms/${code}/leave`)
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export default RoomService;
