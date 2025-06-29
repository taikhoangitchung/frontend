"use client"

import {useEffect, useState} from "react"
import {useFormik} from "formik"
import {toast} from "sonner"

import {Loader2, Send, ArrowLeft} from "lucide-react"
import {Button} from "../ui/button"
import {Card} from "../ui/card"
import {Textarea} from "../ui/textarea"
import {Input} from "../ui/input"
import {Checkbox} from "../ui/checkbox"
import {RadioGroup, RadioGroupItem} from "../ui/radio-group"

import QuestionService from "../../services/QuestionService"
import CategoryService from "../../services/CategoryService"
import TypeService from "../../services/TypeService"
import DifficultyService from "../../services/DifficultyService"
import {initialAnswers} from "../../util/defaultAnswers"
import {cn} from "../../lib/utils"
import {getAnswerButtonColor} from "../../util/getAnswerButtonColor";
import {validateImage} from "../../util/validateImage";
import DropDown from "../dropdown/DropDown";
import {questionSchema} from "../../yup/questionSchema";
import {useRouter} from "next/navigation";

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
            answers: [],
        },
        validationSchema: questionSchema
    })

    useEffect(() => {
        if (formik.values.type) {
            formik.setFieldValue("answers", initialAnswers(formik.values.type))
        }
    }, [formik.values.type])

    const handleSelectChange = (field) => (value) => {
        formik.setFieldValue(field, value)
    }

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file && validateImage(file)) {
            setImage({
                file,
                preview: URL.createObjectURL(file),
            });
        }
    };
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
            const formData = new FormData()
            formData.append("content", formik.values.content)
            formData.append("category", formik.values.category)
            formData.append("type", formik.values.type)
            formData.append("difficulty", formik.values.difficulty)
            formik.values.answers.forEach((answer, index) => {
                formData.append(`answers[${index}].content`, answer.content)
                formData.append(`answers[${index}].correct`, answer.correct)
            })
            if (image?.file) {
                formData.append("image", image.file)
            }
            await QuestionService.create(formData)
            toast.success("Tạo câu hỏi thành công! 🎉")
            formik.resetForm()
            setImage(null)
        } catch (err) {
            toast.error(err.response?.data || "Tạo câu hỏi thất bại")
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
                    <Card className="bg-black/20 border-white/20 backdrop-blur-sm p-6 lg:col-span-3">
                        <h3 className="text-white font-semibold text-lg">Upload hình ảnh</h3>
                        {!image ? (
                            <div
                                className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-white/50 hover:bg-white/5 transition-all duration-200 cursor-pointer h-[200px] flex flex-col justify-center"
                                onDragOver={(e) => e.preventDefault()}
                                onDragEnter={(e) => e.preventDefault()}
                                onDragLeave={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files[0];
                                    if (file && validateImage(file)) {
                                        setImage({
                                            file,
                                            preview: URL.createObjectURL(file),
                                        });
                                    }
                                }}
                            >
                                <Input type="file" accept="image/*" onChange={handleImageChange} className="hidden"
                                       id="image-upload"/>
                                <label htmlFor="image-upload" className="cursor-pointer block">
                                    <div className="w-12 h-6 text-white/70 mx-auto mb-3">📁</div>
                                    <p className="text-white/80 mb-2">Chọn tệp</p>
                                    <p className="text-white/60 text-sm">Kéo thả hoặc click để chọn ảnh</p>
                                </label>
                            </div>
                        ) : (
                            <div className="relative">
                                <div
                                    className="border-2 border-white/30 rounded-lg p-4 bg-white/5 cursor-pointer hover:scale-105 transition-all duration-200"
                                    onClick={() => setShowImageModal(true)}
                                >
                                    <img
                                        src={image?.preview || "/placeholder.svg"}
                                        alt="Preview"
                                        className="w-full h-[163px] object-cover rounded-lg"
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="font-semibold absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-all duration-200 cursor-pointer"
                                    onClick={() => setImage(null)}
                                >
                                    ✕
                                </Button>
                            </div>
                        )}
                    </Card>

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
                                src={URL.createObjectURL(image) || "/placeholder.svg"}
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