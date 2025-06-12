import axiosInstance from "@/services/axiosConfig"

class QuestionService {
    static async create(questionData) {
        try {
            return await axiosInstance.post("/questions", questionData)
        } catch (error) {
            console.error("Lỗi khi tạo câu hỏi", error)
            throw error
        }
    }

    static async getAll() {
        try {
            return await axiosInstance.get("/questions")
        } catch (error) {
            console.error("Lỗi khi lấy danh sách câu hỏi", error)
            throw error
        }
    }

    static async getById(id) {
        try {
            return await axiosInstance.get(`/questions/${id}`)
        } catch (error) {
            console.error("Lỗi khi lấy câu hỏi theo ID", error)
            throw error
        }
    }

    static async update(id, questionData) {
        try {
            return await axiosInstance.put(`/questions/${id}`, questionData)
        } catch (error) {
            console.error("Lỗi khi cập nhật câu hỏi", error)
            throw error
        }
    }

    static async delete(id) {
        try {
            return await axiosInstance.delete(`/questions/${id}`)
        } catch (error) {
            console.error("Lỗi khi xóa câu hỏi", error)
            throw error
        }
    }
}

export default QuestionService
