import axiosInstance from "../config/axiosConfig";

class UserService {
    static async blockUser(userId) {
        try {
            return await axiosInstance.patch(`/users/${userId}/block`);
        } catch (error) {
            throw error;
        }
    }

    static async checkToken(token) {
        try {
            return await axiosInstance.get(`/users/check-token/${token}`);
        } catch (error) {
            console.error(`Lỗi khi check token`, error);
            throw error;
        }
    }

    static async checkDuplicatePassword(param) {
        try {
            return await axiosInstance.patch(`/users/check-duplicate`, param);
        } catch (error) {
            console.error(`Lỗi trùng mật khẩu cũ`, error);
            throw error;
        }
    }

    static async recoverPassword(param) {
        try {
            return await axiosInstance.patch(`/users/recover-password`, param);
        } catch (error) {
            console.error(`Lỗi khi recover password`, error);
            throw error;
        }
    }

    static async searchFollowNameAndEmail(keyName, keyEmail) {
        try {
            const params = {};
            if (keyName && keyName.trim() !== "") params.keyName = keyName;
            if (keyEmail && keyEmail.trim() !== "") params.keyEmail = keyEmail;
            return await axiosInstance.get("/users/search", {params});
        } catch (error) {
            console.error(`Lỗi khi tìm kiếm người dùng với keyName = ${keyName}, keyEmail = ${keyEmail}`, error);
            throw error;
        }
    }

    static async getAllExceptAdmin() {
        try {
            return await axiosInstance.get("/users");
        } catch (error) {
            console.error("Lỗi khi lấy danh sách người dùng", error);
            throw error;
        }
    }

    static async login(loginRequest) {
        try {
            return await axiosInstance.patch("/users/login", loginRequest);
        } catch (error) {
            throw error;
        }
    }

    static async register(form) {
        try {
            return await axiosInstance.post("/users/register", form);
        } catch (error) {
            throw error;
        }
    }

    static async changePassword(changePasswordRequest) {
        try {
            return await axiosInstance.patch("/users/change-password", changePasswordRequest);
        } catch (error) {
            console.error("Lỗi khi đổi mật khẩu", error);
            throw error;
        }
    }

    static async findId(email) {
        try {
            return await axiosInstance.get("/users/find-id", {params: {email}});
        } catch (error) {
            throw error;
        }
    }

    static async confirmEmail(email) {
        try {
            await axiosInstance.patch("/users/confirm", {email: email});
        } catch (error) {
            throw error;
        }
    }

    static async getProfile(email) {
        try {
            return await axiosInstance.get("/users/profile", {params: {email}});
        } catch (error) {
            console.error(`Lỗi khi lấy thông tin user với email: ${email}`, error);
            throw error;
        }
    }

    static async editProfile(formData) {
        try {
            return await axiosInstance.patch("/users/edit", formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });
        } catch (error) {
            console.error("Lỗi khi cập nhật thông tin user", error);
            throw error;
        }
    }

    static async unblockUser(id) {
        try {
            return await axiosInstance.patch(`/users/${id}/unblock`);
        } catch (error) {
            throw error;
        }
    }

    static async refreshToken(refreshToken) {
        try {
            return await axiosInstance.post("/users/refresh-token", {refreshToken});
        } catch (error) {
            throw error;
        }
    }

    static async getAvatar() {
        try {
            return await axiosInstance.get(`/users/avatar`);
        } catch (error) {
            throw error;
        }
    }
}

export default UserService;