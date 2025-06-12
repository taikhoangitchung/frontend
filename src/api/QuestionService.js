import instance from "@/api/config";

class QuestionService {
    static async findAllQuestions(userId) {
        return instance.get(`/questions/list/${userId}`);
    }
}

export default QuestionService;
