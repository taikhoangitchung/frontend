"use client"

import {useEffect, useState} from "react"
import {Input} from "../../../../components/ui/input"
import {Label} from "../../../../components/ui/label"
import {Card, CardContent, CardHeader, CardTitle} from "../../../../components/ui/card"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../../../components/ui/select"
import {Badge} from "../../../../components/ui/badge"
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Circle,
    Clock,
    Globe,
    ListIcon,
    Plus,
    Search,
    Sparkles,
    Star,
    Tag,
    Target,
    Trash2,
    Trophy,
    User,
    Zap,
} from "lucide-react"
import {Button} from "../../../../components/ui/button"
import {FaFireAlt} from "react-icons/fa"
import CategoryService from "../../../../services/CategoryService"
import DifficultyService from "../../../../services/DifficultyService"
import {useFormik} from "formik"
import * as Yup from "yup"
import {toast} from "sonner"
import QuestionService from "../../../../services/QuestionService"
import ExamService from "../../../../services/ExamService"
import {useRouter} from "next/navigation"
import {FaCircleQuestion} from "react-icons/fa6";

const questionLimits = [
    {value: 20, label: "20 câu"},
    {value: 40, label: "40 câu"},
    {value: 45, label: "45 câu"},
    {value: 10000, label: "Không giới hạn"},
]

export default function CreateExam({id}) {
    const isEdit = id
    const router = useRouter()
    const [oldTitle, setOldTitle] = useState("")
    const [categories, setCategories] = useState([])
    const [difficulties, setDifficulties] = useState([])

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [questionBank, setQuestionBank] = useState([])
    const [selectedQuestion, setSelectedQuestion] = useState([])
    const [questionSource, setQuestionSource] = useState("-1")
    const [searchTerm, setSearchTerm] = useState("")

    const [expandedQuestions, setExpandedQuestions] = useState(new Map())
    const [userId, setUserId] = useState(Number(localStorage.getItem("id")))

    const ExamSchema = Yup.object({
        title: Yup.string().required("Tiêu đề không được để trống"),
        difficultyId: Yup.number().test("not-default", "Hãy chọn một độ khó", (value) => value !== -1),
        categoryId: Yup.number().test("not-default", "Hãy chọn một thể loại", (value) => value !== -1),
        passScore: Yup.number()
            .min(1, "Tỉ lệ số câu đúng để đạt không thể âm")
            .max(100, "Tỉ lệ số câu đúng để đạt không thể lớn hơn 100%"),
        duration: Yup.number()
            .min(1, "Thời gian không thê quá ngắn")
    })

    const formik = useFormik({
        initialValues: {
            title: "",
            authorId: -2,
            difficultyId: -1,
            categoryId: -1,
            duration: 30,
            passScore: 70,
            questionLimit: 20,
            questions: [],
        },
        validationSchema: ExamSchema,
        onSubmit: (values) => {
            if (values.questionLimit < Math.max(...questionLimits.map(limit => limit.value))) {
                if (values.questions.length === 0) {
                    toast.warning("Hãy thêm ít nhất 1 câu hỏi")
                    return;
                } else if (values.questions.length < values.questionLimit) {
                    toast.warning("hãy thêm đủ số lượng câu hỏi")
                    return;
                }
            }

            setIsSubmitting(true)
            ExamService.exist(values.title)
                .then((res1) => {
                    if (res1.data && ((isEdit && oldTitle !== values.title) || !isEdit)) {
                        toast.warning("Tên bài thi đã tồn tại")
                        setIsSubmitting(false)
                    } else {
                        if (isEdit) {
                            const idLoading = toast.loading("Đang cập nhật bài thi ...")
                            const {questions, ...rest} = values
                            const params = {...rest, questionIds: questions.map((q) => q.id)}

                            ExamService.update(params, id)
                                .then((res3) => {
                                    toast.success(res3.data, {id: idLoading})
                                })
                                .catch((err3) => {
                                    toast.error(err3.toString(), {id: idLoading})
                                })
                                .finally(() => setIsSubmitting(false))
                        } else {
                            const idLoading = toast.loading("Đang tạo bài thi ...")
                            const {questions, ...rest} = values
                            const params = {...rest, questionIds: questions.map((q) => q.id)}

                            ExamService.create(params)
                                .then((res2) => {
                                    toast.success(res2.data, {id: idLoading})
                                    router.push("/users/exams")
                                })
                                .catch((err) => {
                                    toast.error(err.response.data, {id: idLoading})
                                    setIsSubmitting(false)
                                })
                        }
                    }
                })
                .catch((err) => {
                    toast.error(err.toString())
                    setIsSubmitting(false)
                })
        },
    })

    useEffect(() => {
        if (isEdit) fetchForEdit()

        formik.setFieldValue("authorId", userId);

        CategoryService.getAll()
            .then((res) => setCategories(res.data))
            .catch((err) => toast.error(err.response.data))
        DifficultyService.getAll()
            .then((res) => setDifficulties(res.data))
            .catch((err) => toast.error(err.response.data))
    }, [])

    useEffect(() => {
        QuestionService.filterByCategoryAndSource(
            formik.values.categoryId
            , questionSource
            , userId
            , searchTerm
        )
            .then((res) => {
                setQuestionBank(res.data)
            })
            .catch((err) => toast.error(err.response.data))
    }, [formik.values.categoryId, questionSource, userId, searchTerm])

    const fetchForEdit = () => {
        ExamService.findById(id)
            .then((res) => {
                const questionLimit = questionLimits.find((limit) => limit.value > res.data.questions.length).value
                setOldTitle(res.data.title)

                formik.setFieldValue("title", res.data.title)
                formik.setFieldValue("difficultyId", res.data.difficulty.id)
                formik.setFieldValue("categoryId", res.data.category.id)
                formik.setFieldValue("duration", res.data.duration)
                formik.setFieldValue("passScore", res.data.passScore)
                formik.setFieldValue("questionLimit", questionLimit)
                formik.setFieldValue("questions", res.data.questions)
            })
            .catch((err) => {
                toast.error(err.response.data)
                router.push("/")
            })
    }

    const isQuestionAlreadyAdded = (questionId) => {
        return formik.values.questions.find((q) => q.id === questionId) !== undefined
    }

    const toggleQuestionSelection = (questionId) => {
        if (formik.values.categoryId === -1) {
            toast.warning("Hãy chọn danh mục trước")
        } else {
            if (isQuestionAlreadyAdded(questionId)) {
                toast.warning("Câu hỏi này đã được thêm vào bài kiểm tra!")
                return
            }

            if (selectedQuestion.find((q) => q.id === questionId) === undefined) {
                setSelectedQuestion([...selectedQuestion, questionBank.find((q) => q.id === questionId)])
            } else {
                setSelectedQuestion([...selectedQuestion.filter((q) => q.id !== questionId)])
            }
        }
    }

    const toggleQuestionExpansion = (questionId, added) => {
        setExpandedQuestions((prev) => {
            const newMap = new Map(prev)
            if (newMap.has(questionId)) {
                newMap.delete(questionId)
            } else {
                newMap.set(questionId, {added: added})
            }
            return newMap
        })
    }

    const addSelectedQuestions = () => {
        const newQuestions = selectedQuestion.filter((q) => !isQuestionAlreadyAdded(q.id))

        if (formik.values.questions.length >= formik.values.questionLimit) {
            toast.warning("Đã đạt số câu hỏi tối đa")
        } else if (formik.values.questions.length >= 0) {
            const questionCanAdd = newQuestions.slice(0, formik.values.questionLimit - formik.values.questions.length)

            if (questionCanAdd.length !== selectedQuestion.length) {
                toast.warning(`Số lượng câu hỏi vượt giới hạn: ${selectedQuestion.length - questionCanAdd.length}.`)
            }

            formik.setFieldValue("questions", [...formik.values.questions, ...questionCanAdd])
            setSelectedQuestion([])
        }
    }

    const removeQuestion = (id) => {
        formik.setFieldValue("questions", [...formik.values.questions.filter((q) => q.id !== id)])
    }

    const QuestionCard = ({question, index, showRemove = false, onRemove, onToggleSelect, displayAdded}) => {
        const added = formik.values.questions.find((q) => q.id === question.id) !== undefined
        const isExpanded = expandedQuestions.has(question.id) && added === displayAdded
        const isToggleSelected = selectedQuestion.find((q) => q.id === question.id) !== undefined
        const isAlreadyAdded = isQuestionAlreadyAdded(question.id)

        return (
            <div
                className={`border-2 rounded-lg transition-all duration-300 shadow-sm ${
                    isAlreadyAdded
                        ? "bg-gray-100 border-gray-300 opacity-60"
                        : isToggleSelected
                            ? "bg-purple-50 border-purple-400 shadow-md"
                            : "bg-white border-gray-300 hover:border-purple-300 hover:shadow-md"
                }`}
            >
                {/* Header - Always visible */}
                <div
                    className={`p-4 ${!isAlreadyAdded && onToggleSelect ? "cursor-pointer" : ""}`}
                    onClick={!isAlreadyAdded && onToggleSelect ? () => onToggleSelect(question.id) : undefined}
                >
                    <div className="flex items-start gap-3">
                        {!displayAdded && (
                            <div className="mt-1">
                                {isAlreadyAdded ? (
                                    <CheckCircle2 className="h-5 w-5 text-gray-400"/>
                                ) : isToggleSelected ? (
                                    <CheckCircle2 className="h-5 w-5 text-purple-600"/>
                                ) : (
                                    <Circle className="h-5 w-5 text-gray-400"/>
                                )}
                            </div>
                        )}
                        {index !== undefined && !onToggleSelect &&
                            <Badge className="bg-purple-600 text-white">{index + 1}</Badge>}
                        <div className="flex-1">
                            <h4 className={`font-medium text-sm mb-3 text-gray-900 ${isAlreadyAdded ? "opacity-60" : ""}`}>
                                {question.content}
                                {isAlreadyAdded && (
                                    <Badge variant="outline" className="ml-2 text-xs border-gray-300 text-gray-500">
                                        Đã thêm
                                    </Badge>
                                )}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                <Badge
                                    variant="outline"
                                    className={`text-xs border-gray-300 text-gray-600 ${isAlreadyAdded ? "opacity-60" : ""}`}
                                >
                                    {question.category.name}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={`text-xs border-gray-300 text-gray-600 ${isAlreadyAdded ? "opacity-60" : ""}`}
                                >
                                    {question.difficulty.name}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={`text-xs border-gray-300 text-gray-600 ${isAlreadyAdded ? "opacity-60" : ""}`}
                                >
                                    {question.user.id === userId ? "tôi" : question.user.username}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Expand/Collapse Button */}
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleQuestionExpansion(question.id, added)
                                }}
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1"
                                title={isExpanded ? "Thu gọn" : "Xem đáp án"}
                            >
                                {isExpanded ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
                            </Button>
                            {showRemove && onRemove && (
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onRemove(question.id)
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="cursor-pointer text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                                >
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expandable Content - Options */}
                {isExpanded && question.answers.length > 0 && (
                    <div className="px-4 pb-4">
                        <div className="border-t border-gray-200 pt-3 mt-1">
                            <div className="grid grid-cols-1 gap-2 text-xs">
                                {question.answers.map((option) => (
                                    <div
                                        key={option.id}
                                        className={`p-3 rounded-lg transition-all duration-200 border ${
                                            option.correct
                                                ? "bg-green-50 border-green-300 text-green-800 shadow-sm"
                                                : "bg-gray-50 border-gray-200 text-gray-700"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                      <span className={`font-semibold ${option.correct ? "text-green-700" : "text-gray-600"}`}>
                        {String.fromCharCode(65 + option.id)}.
                      </span>
                                            <span>{option.name}</span>
                                            {option.correct &&
                                                <CheckCircle2 className="h-4 w-4 ml-auto text-green-600"/>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 p-2">
            <div className="mx-auto max-w-full space-y-2 px-2">
                {/* Back Button */}
                <div className="pt-2">
                    <Button
                        onClick={() => router.back()}
                        variant="outline"
                        className="cursor-pointer bg-white text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4"/>
                        Quay lại
                    </Button>
                </div>

                {/* Header */}
                <div className="text-center space-y-1 py-2">
                    <div className="flex justify-center items-center gap-3 mb-3">
                        <div className="p-3 bg-purple-600 rounded-full">
                            <Sparkles className="h-8 w-8 text-white"/>
                        </div>
                        <h1 className="text-5xl font-bold text-gray-900">Tạo Bài Kiểm Tra</h1>
                        <div className="p-3 bg-purple-600 rounded-full">
                            <Zap className="h-8 w-8 text-white"/>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Exam Creation */}
                    <div className="space-y-6">
                        {/* Basic Info Card */}
                        <Card className="p-0 shadow-lg border-gray-300 bg-white">
                            <CardHeader className="bg-purple-600 text-white rounded-t-lg p-0">
                                <CardTitle className="flex items-center gap-3 text-xl p-4 h-16">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <BookOpen className="h-6 w-6"/>
                                    </div>
                                    Thông Tin Cơ Bản
                                    <Trophy className="h-5 w-5 ml-auto"/>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5 bg-white">
                                <div className="space-y-3">
                                    <Label htmlFor="title"
                                           className="text-gray-700 font-medium flex items-center gap-2">
                                        <Star className="h-4 w-4 text-purple-600"/>
                                        Tiêu đề bài kiểm tra
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="Nhập tiêu đề bài kiểm tra..."
                                        value={formik.values.title}
                                        onChange={formik.handleChange}
                                        className="border-gray-300 bg-gray-50 focus:border-purple-500 focus:ring-purple-500 focus:bg-white h-10"
                                    />
                                    {formik.touched.title && formik.errors.title && (
                                        <div className="text-red-500 text-sm mt-1">{formik.errors.title}</div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2 md:col-span-1">
                                        <Label className="text-gray-700 font-medium h-6 flex items-center gap-2">
                                            <FaFireAlt className="h-4 w-4 text-purple-600"/>
                                            Độ khó
                                        </Label>
                                        <Select
                                            value={formik.values.difficultyId === -1 ? "" : formik.values.difficultyId}
                                            onValueChange={(value) => formik.setFieldValue("difficultyId", value === "" ? -1 : Number(value))}
                                        >
                                            <SelectTrigger
                                                className="border-gray-300 bg-gray-50 focus:border-purple-500 focus:bg-white w-full h-10">
                                                <SelectValue placeholder="Chọn độ khó"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                {difficulties.map((diff) => (
                                                    <SelectItem key={diff.id} value={diff.id}
                                                                className="cursor-pointer">
                                                        <div className="flex items-center gap-2">{diff.name}</div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formik.touched.difficultyId && formik.errors.difficultyId && (
                                            <div
                                                className="text-red-500 text-sm mt-1">{formik.errors.difficultyId}</div>
                                        )}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-gray-700 font-medium h-6 flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-purple-600"/>
                                            Danh mục
                                        </Label>
                                        <Select
                                            value={formik.values.categoryId === -1 ? "" : formik.values.categoryId}
                                            onValueChange={(value) => formik.setFieldValue("categoryId", value === "" ? -1 : Number(value))}
                                            disabled={formik.values.questions.length > 0}
                                        >
                                            <SelectTrigger
                                                className="border-gray-300 bg-gray-50 focus:border-purple-500 w-full h-10">
                                                <SelectValue placeholder="Chọn danh mục"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formik.touched.categoryId && formik.errors.categoryId && (
                                            <div className="text-red-500 text-sm mt-1">{formik.errors.categoryId}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium h-6 flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-purple-600"/>
                                            Thời gian (phút)
                                        </Label>
                                        <Input
                                            type="number"
                                            value={formik.values.duration}
                                            onChange={(e) => formik.setFieldValue("duration", Number(e.target.value))}
                                            className="border-gray-300 bg-gray-50 focus:border-purple-500 focus:ring-purple-500 focus:bg-white h-10"
                                        />
                                        {formik.touched.duration && formik.errors.duration && (
                                            <div className="text-red-500 text-sm mt-1">{formik.errors.duration}</div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium h-6 flex items-center gap-2">
                                            <Target className="h-4 w-4 text-purple-600"/>
                                            Điểm đạt (%)
                                        </Label>
                                        <Input
                                            type="number"
                                            value={formik.values.passScore}
                                            onChange={(e) => formik.setFieldValue("passScore", Number(e.target.value))}
                                            className="border-gray-300 bg-gray-50 focus:border-purple-500 focus:ring-purple-500 focus:bg-white h-10"
                                        />
                                        {formik.touched.passScore && formik.errors.passScore && (
                                            <div className="text-red-500 text-sm mt-1">{formik.errors.passScore}</div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium h-6 flex items-center">
                                            <FaCircleQuestion className="h-4 w-4 text-purple-600"/>
                                            Số lượng câu hỏi
                                        </Label>
                                        <Select
                                            value={formik.values.questionLimit}
                                            onValueChange={(value) => formik.setFieldValue("questionLimit", value)}
                                            disabled={formik.values.questions.length > 0}
                                        >
                                            <SelectTrigger
                                                className="border-gray-300 bg-gray-50 focus:border-purple-500 w-full h-10">
                                                <SelectValue placeholder="Chọn số câu"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                {questionLimits.map((limit) => (
                                                    <SelectItem key={limit.value} value={limit.value}>
                                                        {limit.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Selected Questions */}
                        <Card className="p-0 shadow-lg border-gray-300 bg-white">
                            <CardHeader className="bg-purple-600 text-white rounded-t-lg p-0">
                                <CardTitle className="flex items-center justify-between text-xl p-4 h-16">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <ListIcon className="h-6 w-6"/>
                                        </div>
                                        Câu Hỏi Đã Chọn ({formik.values.questions.length})
                                    </div>
                                    <Badge className="bg-white/20 text-white border-white/30">
                                        {formik.values.questions.length} / {formik.values.questionLimit === 10000 ? "∞" : formik.values.questionLimit}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 max-h-96 overflow-y-auto bg-white">
                                {formik.values.questions.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Circle className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                                        <p>Chưa có câu hỏi nào được chọn</p>
                                        <p className="text-sm">Hãy chọn câu hỏi từ ngân hàng bên phải!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {formik.values.questions.map((question, index) => (
                                            <QuestionCard
                                                key={question.id}
                                                question={question}
                                                index={index}
                                                showRemove={true}
                                                onRemove={removeQuestion}
                                                displayAdded={true}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="text-center">
                            <Button
                                type={"submit"}
                                onClick={formik.handleSubmit}
                                className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 text-xl font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
                                disabled={isSubmitting}
                            >
                                <Sparkles className="h-6 w-6 mr-2"/>
                                {id
                                    ? isSubmitting
                                        ? "Đang cập nhật bài kiểm tra ..."
                                        : "Cập nhật Bài Kiểm Tra"
                                    : isSubmitting
                                        ? "Đang tạo bài kiểm tra ..."
                                        : "Tạo Bài Kiểm Tra"}
                                <Zap className="h-6 w-6 ml-2"/>
                            </Button>
                        </div>
                    </div>

                    {/* Right Column - Question Bank */}
                    <div className="space-y-6">
                        <Card className="p-0 shadow-lg border-gray-300 bg-white">
                            <CardHeader className="bg-purple-600 text-white rounded-t-lg p-0">
                                <CardTitle className="flex items-center gap-3 text-xl p-4 h-16">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Search className="h-6 w-6"/>
                                    </div>
                                    Ngân Hàng Câu Hỏi
                                    <Badge className="bg-white/20 text-white border-white/30 ml-auto">
                                        {`${selectedQuestion.length} đã chọn`}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3 bg-white">
                                <div className="flex flex-col md:flex-row gap-4 w-full">
                                    {/* Filters - Compact Layout */}
                                    <div className="space-y-2 w-full md:w-auto flex-shrink-0">
                                        <Label className="text-gray-700 font-medium text-sm flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-purple-600"/>
                                            Nguồn câu hỏi
                                        </Label>
                                        <Select value={questionSource} onValueChange={setQuestionSource}>
                                            <SelectTrigger
                                                className="border-gray-300 bg-gray-50 focus:border-purple-500 h-10">
                                                <SelectValue placeholder="Chọn nguồn câu hỏi"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                <SelectItem value={`${formik.values.authorId}`}>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4"/>
                                                        Câu hỏi của tôi
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value={"-1"}>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4"/>
                                                        Câu hỏi của người khác
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value={"-999"}>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4"/>
                                                        Tất cả
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Search - Compact */}
                                    <div className="space-y-2 w-full">
                                        <Label className="text-gray-700 font-medium text-sm flex items-center gap-2">
                                            <Search className="h-4 w-4 text-purple-600"/>
                                            Tìm kiếm
                                        </Label>
                                        <div className="relative">
                                            <Search
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                                            <Input
                                                placeholder="Tìm kiếm theo username"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 border-gray-300 bg-gray-50 focus:border-purple-500 focus:ring-purple-500 focus:bg-white h-9"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Add Selected Button */}
                                {selectedQuestion.length > 0 && (
                                    <Button
                                        onClick={addSelectedQuestions}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium h-9"
                                    >
                                        <Plus className="h-4 w-4 mr-2"/>
                                        Thêm {selectedQuestion.length} câu hỏi đã chọn
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Questions List */}
                        <Card className="p-0 shadow-lg border-gray-300 bg-white">
                            <CardHeader className="bg-purple-600 text-white rounded-t-lg p-0">
                                <CardTitle className="flex items-center justify-between text-lg p-4 h-16">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <ListIcon className="h-6 w-6"/>
                                        </div>
                                        Danh Sách Câu Hỏi ({questionBank.length})
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 bg-white">
                                <div className="max-h-96 overflow-y-auto space-y-3">
                                    {questionBank.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Search className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                                            <p>Không tìm thấy câu hỏi nào</p>
                                        </div>
                                    ) : (
                                        questionBank.map((question) => (
                                            <QuestionCard
                                                key={question.id}
                                                question={question}
                                                onToggleSelect={toggleQuestionSelection}
                                                displayAdded={false}
                                            />
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
