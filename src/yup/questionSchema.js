import * as Yup from "yup"

export const questionSchema = Yup.object().shape({
    category: Yup.string().required("Vui lòng chọn danh mục"),
    type: Yup.string().required("Vui lòng chọn loại câu hỏi"),
    difficulty: Yup.string().required("Vui lòng chọn độ khó"),
    content: Yup.string().required("Vui lòng nhập nội dung câu hỏi"),
    answers: Yup.array()
        .of(
            Yup.object().shape({
                content: Yup.string().trim().required("Vui lòng nhập nội dung đáp án"),
                correct: Yup.boolean(),
            }),
        )
        .test("validCorrectAnswers", "Số lượng đáp án đúng không hợp lệ", function (answers) {
            const type = this.parent.type
            const correctCount = answers.filter((a) => a.correct).length
            if (type === "multiple") return correctCount >= 2
            return correctCount === 1
        }),
})
