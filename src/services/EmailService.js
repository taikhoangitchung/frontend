import axiosInstance from "./config";

class EmailService {
    static async sendMail(params) {
        try {
            return await axiosInstance.post(`/email/send`,params);
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    static async sendAnnounce(params) {
        try {
            return await axiosInstance.post(`/email/send-announce`,params);
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    static async sendCode(params) {
        try {
            return await axiosInstance.post(`/email/send-code`,params);
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

export default EmailService;
