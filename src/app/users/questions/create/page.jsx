"use client"

import { useState } from "react"
import {initialAnswers} from "../../../../initvalues/answer";
import QuestionFormUI from "../../../../components/CreateOrEditQuestion";

const defaultType = "single"

export default function QuestionCreateForm() {
    const [initialValues, setInitialValues] = useState({
        category: "",
        difficulty: "",
        type: defaultType,
        content: "",
        answers: initialAnswers(defaultType)
    })

    return (
        <QuestionFormUI
            initialValues={initialValues}
            isEdit={false}
        />
    )
}
