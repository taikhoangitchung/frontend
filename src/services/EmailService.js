import axiosInstance from "./config";

class EmailService {
    static async sendMail(params) {
        try {
            return await axiosInstance.post(`/email/send`,params);
        } catch (error) {
            return Promise.reject(error)
        }
    }

    static async sendAnnounce(params) {
        try {
            return await axiosInstance.post(`/email/send-announce`,params);
        } catch (error) {
            return Promise.reject(error)
        }
    }

    static async sendCode(params) {
        try {
            return await axiosInstance.post(`/email/send-code`,params);
        } catch (error) {
            throw error
        }
    }
}

export default EmailService;
