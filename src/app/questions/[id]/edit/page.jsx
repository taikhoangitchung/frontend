"use client"

import {useEffect, useState} from "react"
import {useParams} from "next/navigation"
import QuestionFormUI from "../../../../components/CreateOrEditQuestion"
import QuestionService from "../../../../services/QuestionService"
import {Loader2} from "lucide-react"

export default function EditQuestion() {
    const {id} = useParams()
    const [initialValues, setInitialValues] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchQuestion() {
            try {
                const res = await QuestionService.getById(id)
                const question = res.data
                setInitialValues({
                    category: question.category.name,
                    type: question.type.name,
                    difficulty: question.difficulty.name,
                    content: question.content,
                    answers: question.answers,
                })
            } catch (error) {
                console.error("Failed to fetch question:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchQuestion()
    }, [id])

    if (loading || !initialValues) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-purple-900">
                <Loader2 className="h-8 w-8 animate-spin text-white"/>
            </div>
        )
    }

    return (
        <QuestionFormUI
            initialValues={initialValues}
            isEdit={true}
            questionId={id}
        />
    )
}
