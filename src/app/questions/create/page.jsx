"use client"

import QuestionFormUI from "../../../components/CreateOrEditQuestion"

export default function CreateQuestion() {
    return (
        <QuestionFormUI
            initialValues={null} // Dùng default trong formik
            isEdit={false}
        />
    )
}
