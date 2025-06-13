export const initialAnswers = (type) => {
    switch (type) {
        case "boolean":
            return [
                {
                    id: 1,
                    content: "",
                    color: "from-green-400 to-green-600",
                    correct: true,
                }, {
                    id: 2,
                    content: "",
                    color: "from-red-400 to-red-600",
                    correct: false,
                }
            ];
        case "single":
        case "multiple":
            return [
                {
                    id: 1,
                    content: "",
                    color: "from-blue-400 to-blue-600",
                    correct: true
                }, {
                    id: 2,
                    content: "",
                    color: "from-teal-400 to-teal-600"
                    , correct: false
                }, {
                    id: 3,
                    content: "",
                    color: "from-orange-400 to-orange-600"
                    , correct: false
                }, {
                    id: 4,
                    content: "",
                    color: "from-pink-400 to-pink-600"
                    , correct: false
                }]
    }
};
