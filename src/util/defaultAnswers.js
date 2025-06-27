export const initialAnswers = (type) => {
    switch (type) {
        case "boolean":
            return [
                {
                    id: 1,
                    content: "",
                    correct: true,
                }, {
                    id: 2,
                    content: "",
                    correct: false,
                }
            ];
        case "single":
        case "multiple":
            return [
                {
                    id: 1,
                    content: "",
                    correct: true
                }, {
                    id: 2,
                    content: "",
                    correct: false
                }, {
                    id: 3,
                    content: "",
                    correct: false
                }, {
                    id: 4,
                    content: "",
                    correct: false
                }]
    }
};
