import axiosInstance from "../config/axiosConfig";

class QuestionService {
    static async import(data, userId) {
        try {
            const params = {questions: data, userId: userId};
            return await axiosInstance.post("/questions/import", params)
        } catch (error) {
            throw error;
        }
    }

    static async create(questionData) {
        try {
            return await axiosInstance.post("/questions", questionData, {
                headers: {'Content-Type': 'multipart/form-data'}
            })
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async getAll(page = 0, size = 20) { // Thêm page và size mặc định
        try {
            return await axiosInstance.get("/questions", {
                params: {
                    page: page,
                    size: size
                }
            });
        } catch (error) {
            throw error;
        }
    }

    static async filterByCategoryAndSource(categoryId, sourceId, currentUserId, username, page = 0, size = 20) {
        try {
            const params = {
                categoryId: categoryId,
                sourceId: sourceId,
                currentUserId: currentUserId,
                username: username,
                page: page,
                size: size
            };
            return await axiosInstance.post("/questions/filter", params);
        } catch (error) {
            throw error;
        }
    }

    static async getById(id) {
        try {
            return await axiosInstance.get(`/questions/${id}`)
        } catch (error) {
            throw error
        }
    }

    static async getByUserId(id) {
        try {
            return await axiosInstance.get(`/questions/user/${id}`)
        } catch (error) {
            throw error
        }
    }

    static async update(id, questionData) {
        try {
            return await axiosInstance.put(`/questions/${id}`, questionData, {
                headers: {'Content-Type': 'multipart/form-data'}
            })
        } catch (error) {
            throw error
        }
    }

    static async delete(id) {
        try {
            return await axiosInstance.delete(`/questions/${id}`)
        } catch (error) {
            throw error
        }
    }

    static async findAllByUser(userId) {
        try {
            return await axiosInstance.get(`/questions/user/${userId}`)
        } catch (error) {
            throw error
        }
    }

    static async checkEditable(id) {
        try {
            return await axiosInstance.get(`/questions/${id}/edit`)
        } catch (error) {
            throw error
        }
    }
}

export default QuestionService
