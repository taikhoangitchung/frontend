"use client"

import {useEffect, useState} from "react"
import {useFormik} from "formik"
import {toast} from "sonner"

import {Loader2, Send, ArrowLeft} from "lucide-react"
import {Button} from "../ui/button"
import {Card} from "../ui/card"
import {Textarea} from "../ui/textarea"
import {Checkbox} from "../ui/checkbox"
import {RadioGroup, RadioGroupItem} from "../ui/radio-group"

import QuestionService from "../../services/QuestionService"
import CategoryService from "../../services/CategoryService"
import TypeService from "../../services/TypeService"
import DifficultyService from "../../services/DifficultyService"
import {initialAnswers} from "../../util/defaultAnswers"
import {cn} from "../../lib/utils"
import {getAnswerButtonColor} from "../../util/getAnswerButtonColor";
import DropDown from "../dropdown/DropDown";
import {questionSchema} from "../../yup/questionSchema";
import {useRouter} from "next/navigation";
import UploadFile from "./UploadFile";
import {getFirstErrorMessage} from "../../util/form/getFirstErrorMessage";
import SupabaseService from "../../services/SupabaseService";
import {supabaseConfig} from "../../config/supabaseConfig";
import {moveFileImage} from "../../util/supabase/moveFileImage";

export default function CreateQuestionForm() {
    const router = useRouter()
    const [image, setImage] = useState(null)
    const [categories, setCategories] = useState([])
    const [types, setTypes] = useState([])
    const [difficulties, setDifficulties] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showImageModal, setShowImageModal] = useState(false)
    const [loading, setLoading] = useState(true)

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
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDropdowns()
    }, [])

    const formik = useFormik({
        initialValues: {
            content: "",
            category: "",
            type: "single",
            difficulty: "",
            answers: initialAnswers("single"),
        },
        validationSchema: questionSchema
    })

    useEffect(() => {
        const {type} = formik.values;
        if (type) {
            formik.setFieldValue("answers", initialAnswers(type))
        }
    }, [formik.values.type])

    const handleSelectChange = (field) => (value) => {
        formik.setFieldValue(field, value)
    }

    const handleSubmit = async () => {
        const errors = await formik.validateForm();
        const message = getFirstErrorMessage(errors);
        if (message) {
            toast.error(message);
            return;
        }

        try {
            setIsSubmitting(true)
            // move image supabase
            let finalImagePath = null;

            if (image?.path) {
                finalImagePath = await moveFileImage(image);
            }

            const { content, category, type, difficulty, answers } = formik.values;

            const payload = {
                content,
                category,
                type,
                difficulty,
                answers,
                image: finalImagePath,
            };
            await QuestionService.create(payload)
            toast.success("Tạo câu hỏi thành công! 🎉")
            formik.resetForm()
            setImage(null)
        } catch (err) {
            toast.error(err.response?.data || err.message || "Tạo câu hỏi thất bại");
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-purple-900">
                <Loader2 className="h-8 w-8 animate-spin text-white"/>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-6 pb-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/users/questions")}
                        className="p-2 text-white hover:bg-red-500 hover:scale-105 transition-all duration-200 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4"/>
                    </Button>
                    <h1 className="text-2xl font-semibold text-white">Tạo câu hỏi mới</h1>
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                    <DropDown
                        placeholder="Chọn danh mục"
                        value={formik.values.category}
                        options={categories}
                        onChange={handleSelectChange("category")}
                    />
                    <DropDown
                        placeholder="Chọn độ khó"
                        value={formik.values.difficulty}
                        options={difficulties}
                        onChange={handleSelectChange("difficulty")}
                    />
                    <DropDown
                        placeholder="Chọn thể loại"
                        value={formik.values.type}
                        options={types}
                        onChange={handleSelectChange("type")}
                        field="type"
                    />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-8">
                    {/* Left Section - Image Upload (3/10) */}
                    <UploadFile image={image} setImage={setImage} setShowImageModal={setShowImageModal}/>

                    {/* Right Section - Question Input (7/10) */}
                    <Card className="bg-black/20 border-white/20 backdrop-blur-sm p-6 lg:col-span-7">
                        <h3 className="text-white font-semibold text-lg">Nội dung câu hỏi</h3>
                        <Textarea
                            name="content"
                            placeholder="Nhập nội dung câu hỏi"
                            value={formik.values.content}
                            onChange={formik.handleChange}
                            spellCheck="false"
                            className="bg-white/10 border-white/30 text-white placeholder:text-white/70 hover:bg-white/20 focus:bg-white/20 transition-all duration-200 resize-none h-[200px]"
                            style={{fontSize: "1.25rem"}}
                        />
                    </Card>
                </div>

                {/* Đáp án */}
                {formik.values.type === "multiple" ? (
                    <div className="grid gap-4 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        {formik.values.answers.map((answer, index) => (
                            <Card key={answer.id}
                                  className={`bg-gradient-to-br ${getAnswerButtonColor(index)} border-none h-60 relative`}>
                                <div className="absolute top-3 right-3">
                                    <Checkbox
                                        checked={answer.correct}
                                        onCheckedChange={(checked) => {
                                            const updated = [...formik.values.answers]
                                            updated[index].correct = checked
                                            formik.setFieldValue("answers", updated)
                                        }}
                                        className="w-6 h-6 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-purple-900 hover:scale-110 transition-all duration-200 cursor-pointer"
                                    />
                                </div>
                                <div className="p-5 pb-0 h-full flex flex-col justify-center">
                                    <Textarea
                                        value={answer.content}
                                        onChange={(e) => {
                                            const updated = [...formik.values.answers]
                                            updated[index].content = e.target.value
                                            formik.setFieldValue("answers", updated)
                                        }}
                                        placeholder={`Nhập đáp án ${index + 1}`}
                                        className="bg-white/10 border-white/50 text-white placeholder:text-white/70 transition-all duration-200 hover:bg-white/20 focus:bg-white/20 resize-y whitespace-pre-wrap overflow-auto h-full w-full p-3 rounded-md"
                                        style={{fontSize: "1.25rem"}} // Thêm inline style để đảm bảo
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
                            <Card key={answer.id}
                                  className={`bg-gradient-to-br ${getAnswerButtonColor(index)} border-none h-60 relative`}>
                                <div className="absolute top-3 right-3">
                                    <RadioGroupItem
                                        value={answer.id.toString()}
                                        id={`answer-${answer.id}`}
                                        className={cn(
                                            "w-6 h-6 rounded-full border-2 border-white/40 text-white relative transition-all duration-200 cursor-pointer hover:scale-110",
                                            "data-[state=checked]:bg-white data-[state=checked]:border-white",
                                            "after:content-['✓'] after:absolute after:text-purple-900 after:font-bold after:text-sm",
                                            "after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2",
                                            "data-[state=unchecked]:after:content-none",
                                        )}
                                    />
                                </div>
                                <div className="p-5 pb-0 h-full flex flex-col justify-center">
                                    <Textarea
                                        value={answer.content}
                                        spellCheck="false"
                                        onChange={(e) => {
                                            const updated = [...formik.values.answers]
                                            updated[index].content = e.target.value
                                            formik.setFieldValue("answers", updated)
                                        }}
                                        placeholder={`Nhập đáp án ${index + 1}`}
                                        className="bg-white/10 border-white/50 text-white placeholder:text-white/70 transition-all duration-200 hover:bg-white/20 focus:bg-white/20 resize-y whitespace-pre-wrap overflow-auto h-full w-full p-3 rounded-md"
                                        style={{fontSize: "1.25rem"}} // Thêm inline style để đảm bảo
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
                        className="bg-purple-500 hover:bg-purple-600 hover:scale-105 text-white px-8 text-base font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                Đang gửi
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4"/>
                                Tạo câu hỏi
                            </>
                        )}
                    </Button>
                </div>
                {/* Image Modal */}
                {showImageModal && image && (
                    <div
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowImageModal(false)}
                    >
                        <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
                            <Button
                                variant="ghost"
                                className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white text-1xl font-semibold z-10 transition-all duration-200 cursor-pointer rounded-full w-9 h-9 flex items-center justify-center"
                                onClick={() => setShowImageModal(false)}
                            >
                                ✕
                            </Button>
                            <img
                                src={image.preview || "/placeholder.svg"}
                                alt="Full size preview"
                                className="w-full h-full max-h-[90vh] object-contain"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}