import axiosInstance from "../config/axiosConfig";

class QuestionService {
    static async create(questionData) {
        try {
            return await axiosInstance.post("/questions", questionData)
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async filterByCategoryAndSource(categoryId, userId) {
        try {
            const params = {categoryId: categoryId, userId: userId};
            return await axiosInstance.post("/questions/filter", params);
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            return await axiosInstance.get("/questions")
        } catch (error) {
            throw error
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
            return await axiosInstance.put(`/questions/${id}`, questionData)
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
}

export default QuestionService
