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
}

export default EmailService;
