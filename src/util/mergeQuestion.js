export default function mergedQuestions(response) {
    return response.data.fullQuestions?.map((question) => {
        const matchedChoice = response.data.choices.find((c) => c.questionId === question.id);
        return {
            ...question,
            selectedAnswerIds: matchedChoice?.selectedAnswerIds || [],
        };
    }) || [];
}
