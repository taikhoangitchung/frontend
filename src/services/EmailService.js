import axiosInstance from "./config";

class EmailService {
    static async sendMail(to, subject, text) {
        try {
            return await axiosInstance.get(`/send-email?to=${to}&subject=${subject}&text=${text}`);
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
