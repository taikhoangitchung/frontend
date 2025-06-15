"use client"

import CreateFormUI from "../../../components/question/CreateOrEdit"

export default function CreateQuestion() {
    return (
        <CreateFormUI
            initialValues={null} // Dùng default trong formik
            isEdit={false}
        />
    )
}
