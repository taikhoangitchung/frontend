"use client"

import {ArrowLeft} from "lucide-react"
import {useRouter} from "next/navigation"
import {useEffect, useState} from "react"
import {useFormik} from "formik"
import * as Yup from "yup"

import {Button} from "./ui/button"
import {Card} from "./ui/card"
import {Textarea} from "./ui/textarea"
import {Input} from "./ui/input"
import {Send, Loader2} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select"
import {RadioGroup, RadioGroupItem} from "./ui/radio-group"
import {Checkbox} from "./ui/checkbox"
import {toast} from "sonner"

import QuestionService from "../services/QuestionService"
import CategoryService from "../services/CategoryService"
import TypeService from "../services/TypeService"
import DifficultyService from "../services/DifficultyService"
import {initialAnswers} from "../initvalues/answer"
import {cn} from "../lib/utils"

export default function QuestionFormUI({initialValues, isEdit = false, questionId = null}) {
    const router = useRouter()
    const [categories, setCategories] = useState([])
    const [types, setTypes] = useState([])
    const [difficulties, setDifficulties] = useState([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchDropdowns = async () => {
        try {
            const [catRes, typeRes, diffRes] = await Promise.all([
                CategoryService.getAll(),
                TypeService.getAll(),
                DifficultyService.getAll(),
            ])
            setCategories(catRes.data)
            setTypes(typeRes.data)
            setDifficulties(diffRes.data)
        } catch (error) {
            console.log(error)
            if (error.response?.status === 403) {
                router.push("/forbidden");
            } else if (error.response?.status === 401) {
                toast.error("Token hết hạn hoặc không hợp lệ. Đang chuyển hướng về trang đăng nhập...")
                setTimeout(() => {
                    router.push("/login");
                }, 2500);
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDropdowns()
    }, [])

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: initialValues || {
            category: "",
            type: "",
            difficulty: "",
            content: "",
            answers: initialAnswers("single"),
        },
        validationSchema: Yup.object().shape({
            category: Yup.string().required("Vui lòng chọn chủ đề"),
            type: Yup.string().required("Vui lòng chọn loại câu hỏi"),
            difficulty: Yup.string().required("Vui lòng chọn độ khó"),
            content: Yup.string().required("Vui lòng nhập nội dung câu hỏi"),
            answers: Yup.array()
                .of(
                    Yup.object().shape({
                        id: Yup.number().required(),
                        content: Yup.string().trim().required("Vui lòng nhập nội dung đáp án"),
                        correct: Yup.boolean(),
                    })
                )
                .test(
                    "validCorrectAnswers",
                    "Số lượng đáp án đúng không hợp lệ",
                    function (answers) {
                        const type = this.parent.type
                        const correctCount = answers.filter((a) => a.correct).length
                        if (type === "multiple") return correctCount >= 2
                        return correctCount === 1
                    }
                ),
        })
    })

    const handleSubmit = async () => {
        const errors = await formik.validateForm()
        if (Object.keys(errors).length > 0) {
            const firstError = Object.values(errors)[0]

            if (typeof firstError === "string") {
                toast.error(firstError)
            } else if (Array.isArray(firstError)) {
                const nestedFirst = firstError.find(e => typeof e === 'object' && e !== null)
                if (nestedFirst) {
                    const nestedMessage = Object.values(nestedFirst)[0]
                    if (typeof nestedMessage === "string") toast.error(nestedMessage)
                }
            }
            return
        }

        const cleanedAnswers = formik.values.answers.map(({content, correct}) => ({
            content,
            correct,
        }))

        const payload = {
            ...formik.values,
            answers: cleanedAnswers,
        }

        console.log(payload)
        try {
            setIsSubmitting(true)
            if (isEdit && questionId) {
                await QuestionService.update(questionId, payload)
                toast.success("Cập nhật câu hỏi thành công!")
            } else {
                await QuestionService.create(payload)
                toast.success("Tạo câu hỏi thành công! 🎉")
                formik.resetForm()
            }
        } catch (err) {
            toast.error(err.response.data)
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        const currentType = formik.values.type;
        if (currentType) {
            formik.setFieldValue("answers", initialAnswers(currentType));
        }
    }, [formik.values.type]);


    const handleSelectChange = (field) => (value) => {
        formik.setFieldValue(field, value)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-purple-900">
                <Loader2 className="h-8 w-8 animate-spin text-white"/>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Back Button and Title */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/users/questions/my")}
                        className="p-2 text-white hover:bg-white/10"
                    >
                        <ArrowLeft className="w-4 h-4"/>
                    </Button>
                    <h1 className="text-2xl font-semibold text-white">
                        {isEdit ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
                    </h1>
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <Select value={formik.values.category} onValueChange={handleSelectChange("category")}>
                        <SelectTrigger className="w-[200px] bg-white/20 text-white border-white/20">
                            <SelectValue placeholder="Chọn chủ đề"/>
                        </SelectTrigger>
                        <SelectContent className="bg-purple-900 text-white border-white/20">
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.name}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={formik.values.difficulty} onValueChange={handleSelectChange("difficulty")}>
                        <SelectTrigger className="w-[200px] bg-white/20 text-white border-white/20">
                            <SelectValue placeholder="Chọn độ khó"/>
                        </SelectTrigger>
                        <SelectContent className="bg-purple-900 text-white border-white/20">
                            {difficulties.map((diff) => (
                                <SelectItem key={diff.id} value={diff.name}>
                                    {diff.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={formik.values.type} onValueChange={handleSelectChange("type")}>
                        <SelectTrigger className="w-[200px] bg-white/20 text-white border-white/20">
                            <SelectValue placeholder="Chọn loại câu hỏi"/>
                        </SelectTrigger>
                        <SelectContent className="bg-purple-900 text-white border-white/20">
                            {types.map((type) => (
                                <SelectItem key={type.id} value={type.name}>
                                    {type.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Question Content */}
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-8 p-8">
                    <Textarea
                        name="content"
                        placeholder="Nhập nội dung câu hỏi"
                        value={formik.values.content}
                        onChange={formik.handleChange}
                        className="bg-transparent border-none text-white placeholder:text-white/60 text-xl resize-none min-h-[100px]"
                    />
                </Card>

                {/* Answer Options */}
                <div
                    className={`grid gap-4 mb-8 ${
                        formik.values.answers.length === 2
                            ? "grid-cols-1 md:grid-cols-2"
                            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                    }`}
                >
                    {formik.values.answers.map((answer, index) => (
                        <Card
                            key={answer.id}
                            className={`bg-gradient-to-br ${answer.color} border-none h-80 relative`}
                        >
                            <div className="absolute top-4 right-4">
                                {formik.values.type === "multiple" ? (
                                    <Checkbox
                                        checked={answer.correct}
                                        onCheckedChange={(checked) => {
                                            const updated = [...formik.values.answers]
                                            updated[index].correct = checked
                                            formik.setFieldValue("answers", updated)
                                        }}
                                        className="w-5 h-5 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-purple-900"
                                    />
                                ) : (
                                    <RadioGroup
                                        value={formik.values.answers.find((a) => a.correct)?.id.toString()}
                                        onValueChange={(val) => {
                                            const updated = formik.values.answers.map((a) => ({
                                                ...a,
                                                correct: a.id.toString() === val,
                                            }))
                                            formik.setFieldValue("answers", updated)
                                        }}
                                    >
                                        <RadioGroupItem
                                            value={answer.id.toString()}
                                            id={`answer-${answer.id}`}
                                            className={cn(
                                                "w-6 h-6 rounded-full border-2 border-white/40 text-white relative transition-colors",
                                                "data-[state=checked]:bg-white data-[state=checked]:border-white",
                                                "after:content-['✓'] after:absolute after:text-purple-900 after:font-bold after:text-sm",
                                                "after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2",
                                                "data-[state=unchecked]:after:content-none"
                                            )}
                                        />
                                    </RadioGroup>
                                )}
                            </div>

                            <div className="p-4 h-full flex flex-col justify-center">
                                <label htmlFor={`answer-${answer.id}`} className="sr-only">
                                    Answer {index + 1}
                                </label>
                                <Input
                                    id={`answer-${answer.id}`}
                                    value={answer.content}
                                    onChange={(e) => {
                                        const updated = [...formik.values.answers]
                                        updated[index].content = e.target.value
                                        formik.setFieldValue("answers", updated)
                                    }}
                                    placeholder={`Nhập đáp án ${index + 1}`}
                                    className="bg-transparent border-none text-white placeholder:text-white/60 text-base h-full"
                                />
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-8 text-base font-semibold"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                {isEdit ? "Đang cập nhật" : "Đang gửi"}
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4"/>
                                {isEdit ? "Cập nhật câu hỏi" : "Tạo câu hỏi"}
                            </>
                        )}

                    </Button>
                </div>
            </div>
        </div>
    )
}
