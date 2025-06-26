"use client"

import { useEffect, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { Loader2, Send, ArrowLeft } from "lucide-react"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Textarea } from "../ui/textarea"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Checkbox } from "../ui/checkbox"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"

import QuestionService from "../../services/QuestionService"
import CategoryService from "../../services/CategoryService"
import TypeService from "../../services/TypeService"
import DifficultyService from "../../services/DifficultyService"
import { initialAnswers } from "../../util/defaultAnswers"
import { cn } from "../../lib/utils"
import { typeVietSub } from "../../util/typeVietsub"

export default function EditQuestionForm() {
    const router = useRouter()
    const { id } = useParams()
    const [categories, setCategories] = useState([])
    const [types, setTypes] = useState([])
    const [difficulties, setDifficulties] = useState([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState(null)
    const [initialTypeSet, setInitialTypeSet] = useState(false)
    const [initialType, setInitialType] = useState(null)

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
            if (error.response?.status === 403) {
                router.push("/forbidden")
            } else if (error.response?.status === 401) {
                toast.error("Token hết hạn hoặc không hợp lệ. Đang chuyển hướng...")
                setTimeout(() => router.push("/login"), 2500)
            }
        }
    }

    const fetchQuestion = async () => {
        if (!id) return
        try {
            const res = await QuestionService.getById(id)
            const q = res.data
            const cleanedQuestion = {
                content: q.content,
                category: q.category.name,
                type: q.type.name,
                difficulty: q.difficulty.name,
                answers: Array.isArray(q.answers)
                    ? q.answers.map((a) => ({
                        id: a.id,
                        content: a.content,
                        correct: !!a.correct,
                        color: a.color,
                    }))
                    : initialAnswers(q.type.name || "single"),
            }
            console.log(cleanedQuestion)
            setEditingQuestion(cleanedQuestion)
        } catch (e) {
            toast.error("Không thể tải câu hỏi")
        }
    }

    useEffect(() => {
        Promise.all([fetchDropdowns(), fetchQuestion()]).finally(() => setLoading(false))
    }, [id])

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: editingQuestion || {
            content: "",
            category: "",
            type: "single",
            difficulty: "",
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
        }),
    })

    useEffect(() => {
        if (editingQuestion && !initialTypeSet) {
            setInitialTypeSet(true)
            setInitialType(editingQuestion.type)
        }
    }, [editingQuestion, initialTypeSet])

    useEffect(() => {
        if (formik.values.type && initialTypeSet && initialType) {
            if (formik.values.type !== initialType) {
                formik.setFieldValue("answers", initialAnswers(formik.values.type))
                setInitialType(formik.values.type)
            }
        }
    }, [formik.values.type, initialTypeSet, initialType])

    const handleSelectChange = (field) => (value) => {
        formik.setFieldValue(field, value)
    }

    const handleSubmit = async () => {
        const errors = await formik.validateForm()
        if (Object.keys(errors).length > 0) {
            const firstError = Object.values(errors)[0]
            if (typeof firstError === "string") {
                toast.error(firstError)
            } else if (Array.isArray(firstError)) {
                const nestedFirst = firstError.find((e) => typeof e === "object" && e !== null)
                if (nestedFirst) {
                    const nestedMessage = Object.values(nestedFirst)[0]
                    if (typeof nestedMessage === "string") toast.error(nestedMessage)
                }
            }
            return
        }
        try {
            setIsSubmitting(true)
            const payload = {
                ...formik.values,
                answers: formik.values.answers.map(({ id, ...rest }) => rest),
            }
            console.log(payload)
            await QuestionService.update(id, payload)
            toast.success("Cập nhật câu hỏi thành công!")
            router.push("/users/questions")
        } catch (err) {
            toast.error(err.response?.data)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-purple-900">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/users/questions")}
                        className="p-2 text-white hover:bg-white/10 hover:scale-[1.02] transition-transform duration-200 ease-in-out cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="text-3xl font-bold text-white tracking-wide">Điều chỉnh câu hỏi & đáp án</h1>
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                    <Select value={formik.values.category} onValueChange={handleSelectChange("category")}>
                        <SelectTrigger className="w-[220px] h-12 bg-white/20 text-white border-white/20 text-base font-medium hover:scale-[1.02] transition-transform duration-200 ease-in-out cursor-pointer">
                            <SelectValue placeholder="Chọn chủ đề" />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-900 text-white border-white/20">
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.name} className="text-base font-medium py-3 hover:bg-white/10 cursor-pointer">
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={formik.values.difficulty} onValueChange={handleSelectChange("difficulty")}>
                        <SelectTrigger className="w-[220px] h-12 bg-white/20 text-white border-white/20 text-base font-medium hover:scale-[1.02] transition-transform duration-200 ease-in-out cursor-pointer">
                            <SelectValue placeholder="Chọn độ khó" />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-900 text-white border-white/20">
                            {difficulties.map((diff) => (
                                <SelectItem key={diff.id} value={diff.name} className="text-base font-medium py-3 hover:bg-white/10 cursor-pointer">
                                    {diff.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={formik.values.type} onValueChange={handleSelectChange("type")}>
                        <SelectTrigger className="w-[220px] h-12 bg-white/20 text-white border-white/20 text-base font-medium hover:scale-[1.02] transition-transform duration-200 ease-in-out cursor-pointer">
                            <SelectValue placeholder="Chọn loại câu hỏi" />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-900 text-white border-white/20">
                            {types.map((type) => (
                                <SelectItem key={type.id} value={type.name} className="text-base font-medium py-3 hover:bg-white/10 cursor-pointer">
                                    {typeVietSub(type.name)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-8 p-8">
                    <Textarea
                        name="content"
                        placeholder="Nhập nội dung câu hỏi"
                        value={formik.values.content}
                        onChange={formik.handleChange}
                        className="bg-transparent border-none text-white placeholder:text-white/60 text-2xl font-medium resize-none min-h-[120px] leading-relaxed"
                    />
                </Card>

                {formik.values.type === "multiple" ? (
                    <div className="grid gap-4 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        {formik.values.answers.map((answer, index) => (
                            <Card
                                key={answer.id}
                                className={`bg-gradient-to-br ${answer.color} border-none h-80 relative shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer`}
                            >
                                <div className="absolute top-4 right-4">
                                    <Checkbox
                                        checked={answer.correct}
                                        onCheckedChange={(checked) => {
                                            const updated = [...formik.values.answers]
                                            updated[index].correct = checked
                                            formik.setFieldValue("answers", updated)
                                        }}
                                        className="w-6 h-6 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-purple-900 hover:scale-[1.05] transition-transform duration-150 ease-in-out cursor-pointer"
                                    />
                                </div>
                                <div className="p-4 h-full flex flex-col justify-center">
                                    <Input
                                        value={answer.content}
                                        onChange={(e) => {
                                            const updated = [...formik.values.answers]
                                            updated[index].content = e.target.value
                                            formik.setFieldValue("answers", updated)
                                        }}
                                        placeholder={`Nhập đáp án ${index + 1}`}
                                        className="bg-transparent border-none text-white placeholder:text-white/60 text-lg font-medium h-full text-center leading-relaxed"
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <RadioGroup
                        value={formik.values.answers.find((a) => a.correct)?.id?.toString() || ""}
                        onValueChange={(val) => {
                            const updated = formik.values.answers.map((a) => ({
                                ...a,
                                correct: a.id.toString() === val,
                            }))
                            formik.setFieldValue("answers", updated)
                        }}
                        className={`grid gap-4 mb-8 grid-cols-1 md:grid-cols-2 ${formik.values.answers.length === 2 ? "" : "lg:grid-cols-4"}`}
                    >
                        {formik.values.answers.map((answer, index) => (
                            <Card
                                key={answer.id}
                                className={`bg-gradient-to-br ${answer.color} border-none h-80 relative shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer`}
                            >
                                <div className="absolute top-4 right-4">
                                    <RadioGroupItem
                                        value={answer.id.toString()}
                                        id={`answer-${answer.id}`}
                                        className={cn(
                                            "w-7 h-7 rounded-full border-2 border-white/40 text-white relative transition-colors",
                                            "data-[state=checked]:bg-white data-[state=checked]:border-white",
                                            "after:content-['✓'] after:absolute after:text-purple-900 after:font-bold after:text-base",
                                            "after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2",
                                            "data-[state=unchecked]:after:content-none",
                                            "hover:scale-[1.05] transition-transform duration-150 ease-in-out cursor-pointer"
                                        )}
                                    />
                                </div>
                                <div className="p-4 h-full flex flex-col justify-center">
                                    <Input
                                        value={answer.content}
                                        onChange={(e) => {
                                            const updated = [...formik.values.answers]
                                            updated[index].content = e.target.value
                                            formik.setFieldValue("answers", updated)
                                        }}
                                        placeholder={`Nhập đáp án ${index + 1}`}
                                        className="bg-transparent border-none text-white placeholder:text-white/60 text-lg font-medium h-full text-center leading-relaxed"
                                    />
                                </div>
                            </Card>
                        ))}
                    </RadioGroup>
                )}

                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-10 py-3 text-lg font-semibold rounded-lg hover:scale-[1.02] transition-transform duration-200 ease-in-out cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                Đang lưu
                            </>
                        ) : (
                            <>
                                <Send className="mr-3 h-5 w-5" />
                                Lưu
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}