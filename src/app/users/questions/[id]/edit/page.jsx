"use client"

import {useEffect, useState} from "react"
import {useParams} from "next/navigation"
import QuestionFormUI from "../../../../../components/CreateOrEditQuestion"
import QuestionService from "../../../../../services/QuestionService"
import {Loader2} from "lucide-react"
import {initialAnswers} from "../../../../../initvalues/answer";

export default function EditQuestion() {
    const {id} = useParams()
    const [question, setQuestion] = useState(null)
    const [loading, setLoading] = useState(true)

    function applyColorsToAnswers(answers, type) {
        const template = initialAnswers(type)
        return answers.map((a, index) => ({
            ...a,
            color: a.color || template[index]?.color || "from-gray-400 to-gray-600"
        }))
    }


    useEffect(() => {
        async function fetchQuestion() {
            try {
                const res = await QuestionService.getById(id)
                const question = res.data

                question.answers = applyColorsToAnswers(question.answers, question.type.name)
                question.type = question.type.name
                question.category = question.category.name
                question.difficulty = question.difficulty.name

                setQuestion(question)
            } catch (error) {
                console.error("Failed to fetch question:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchQuestion()
    }, [id])



    if (loading || !question) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-purple-900">
                <Loader2 className="h-8 w-8 animate-spin text-white"/>
            </div>
        )
    }

    return (
        <QuestionFormUI
            initialValues={question}
            isEdit={true}
            questionId={id}
        />
    )
}
