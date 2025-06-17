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
}

export default EmailService;
