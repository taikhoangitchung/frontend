"use client"

import { useEffect, useState } from "react"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { Badge } from "../../../../components/ui/badge"
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
    Save,
} from "lucide-react"
import { Button } from "../../../../components/ui/button"
import { FaFireAlt } from "react-icons/fa"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { FaCircleQuestion } from "react-icons/fa6"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../../../components/ui/dialog"

const questionLimits = [
    { value: 20, label: "20 câu" },
    { value: 40, label: "40 câu" },
    { value: 45, label: "45 câu" },
    { value: 10000, label: "Không giới hạn" },
]

// Mock data - restored full dataset
const categories = [
    { id: 1, name: "Công nghệ" },
    { id: 2, name: "Toán học" },
    { id: 3, name: "Vật lý" },
]

const difficulties = [
    { id: 1, name: "Dễ" },
    { id: 2, name: "Trung bình" },
    { id: 3, name: "Khó" },
]

const mockQuestions = [
    {
        id: 1,
        content: "Hệ điều hành nào được phát triển bởi Microsoft?",
        category: { id: 1, name: "Công nghệ" },
        difficulty: { id: 1, name: "Dễ" },
        user: { id: 1, username: "alice" },
        answers: [
            { id: 0, name: "Windows", correct: true },
            { id: 1, name: "Linux", correct: false },
            { id: 2, name: "macOS", correct: false },
            { id: 3, name: "Android", correct: false },
        ],
    },
    {
        id: 2,
        content: "Ngôn ngữ nào là lập trình hướng đối tượng?",
        category: { id: 1, name: "Công nghệ" },
        difficulty: { id: 2, name: "Trung bình" },
        user: { id: 2, username: "bob" },
        answers: [
            { id: 0, name: "HTML", correct: false },
            { id: 1, name: "CSS", correct: false },
            { id: 2, name: "Java", correct: true },
            { id: 3, name: "SQL", correct: false },
        ],
    },
    {
        id: 3,
        content: "Phương trình bậc hai ax² + bx + c = 0 có nghiệm khi nào?",
        category: { id: 2, name: "Toán học" },
        difficulty: { id: 2, name: "Trung bình" },
        user: { id: 1, username: "alice" },
        answers: [
            { id: 0, name: "Δ > 0", correct: true },
            { id: 1, name: "Δ < 0", correct: false },
            { id: 2, name: "a = 0", correct: false },
            { id: 3, name: "b = 0", correct: false },
        ],
    },
    {
        id: 4,
        content: "Định luật Newton thứ nhất nói về điều gì?",
        category: { id: 3, name: "Vật lý" },
        difficulty: { id: 1, name: "Dễ" },
        user: { id: 3, username: "charlie" },
        answers: [
            { id: 0, name: "Quán tính", correct: true },
            { id: 1, name: "Gia tốc", correct: false },
            { id: 2, name: "Lực", correct: false },
            { id: 3, name: "Khối lượng", correct: false },
        ],
    },
    {
        id: 5,
        content: "HTML là viết tắt của gì?",
        category: { id: 1, name: "Công nghệ" },
        difficulty: { id: 1, name: "Dễ" },
        user: { id: 2, username: "bob" },
        answers: [
            { id: 0, name: "HyperText Markup Language", correct: true },
            { id: 1, name: "High Tech Modern Language", correct: false },
            { id: 2, name: "Home Tool Markup Language", correct: false },
            { id: 3, name: "Hyperlink and Text Markup Language", correct: false },
        ],
    },
    {
        id: 6,
        content: "Công thức tính diện tích hình tròn là gì?",
        category: { id: 2, name: "Toán học" },
        difficulty: { id: 1, name: "Dễ" },
        user: { id: 1, username: "alice" },
        answers: [
            { id: 0, name: "πr²", correct: true },
            { id: 1, name: "2πr", correct: false },
            { id: 2, name: "πd", correct: false },
            { id: 3, name: "r²", correct: false },
        ],
    },
]

export default function CreateExam({ id }) {
    const isEdit = id
    const router = useRouter()
    const [oldTitle, setOldTitle] = useState("")
    const [categories, setCategories] = useState([])
    const [difficulties, setDifficulties] = useState([])

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [questionBank, setQuestionBank] = useState(mockQuestions)
    const [selectedQuestion, setSelectedQuestion] = useState([])
    const [questionSource, setQuestionSource] = useState("-1")
    const [searchTerm, setSearchTerm] = useState("")
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const [expandedQuestions, setExpandedQuestions] = useState(new Map())
    const [userId, setUserId] = useState(1)

    const [formik, setFormik] = useState({
        values: {
            title: "",
            authorId: 1,
            difficultyId: -1,
            categoryId: -1,
            duration: 30,
            passScore: 70,
            questionLimit: 20,
            questions: [],
        },
        touched: {},
        errors: {},
        handleChange: (e) => {
            const { name, value } = e.target
            setFormik((prev) => ({
                ...prev,
                values: { ...prev.values, [name]: value },
            }))
        },
        setFieldValue: (field, value) => {
            setFormik((prev) => ({
                ...prev,
                values: { ...prev.values, [field]: value },
            }))
        },
        handleSubmit: () => {
            if (formik.values.questions.length === 0) {
                toast.warning("Hãy thêm ít nhất 1 câu hỏi")
                return
            } else if (formik.values.questions.length < formik.values.questionLimit) {
                toast.warning("Hãy thêm đủ số lượng câu hỏi")
                return
            }
            setIsSubmitting(true)
            setTimeout(() => {
                setIsSubmitting(false)
                toast.success("Bài kiểm tra đã được tạo thành công!")
            }, 2000)
        },
    })

    useEffect(() => {
        setCategories([
            { id: 1, name: "Công nghệ" },
            { id: 2, name: "Toán học" },
            { id: 3, name: "Vật lý" },
        ])
        setDifficulties([
            { id: 1, name: "Dễ" },
            { id: 2, name: "Trung bình" },
            { id: 3, name: "Khó" },
        ])
        formik.setFieldValue("authorId", userId)
    }, [])

    const isQuestionAlreadyAdded = (questionId) => {
        return formik.values.questions.find((q) => q.id === questionId) !== undefined
    }

    const clearAllQuestions = () => {
        formik.setFieldValue("questions", [])
        setShowDeleteDialog(false)
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
                newMap.set(questionId, { added: added })
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

    const QuestionCard = ({ question, index, showRemove = false, onRemove, onToggleSelect, displayAdded }) => {
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
                            ? "bg-teal-50 border-teal-400 shadow-md"
                            : "bg-white border-gray-300 hover:border-teal-300 hover:shadow-md"
                }`}
            >
                <div
                    className={`p-4 ${!isAlreadyAdded && onToggleSelect ? "cursor-pointer" : ""}`}
                    onClick={!isAlreadyAdded && onToggleSelect ? () => onToggleSelect(question.id) : undefined}
                >
                    <div className="flex items-start gap-3">
                        {!displayAdded && (
                            <div className="mt-1">
                                {isAlreadyAdded ? (
                                    <CheckCircle2 className="h-5 w-5 text-gray-400" />
                                ) : isToggleSelected ? (
                                    <CheckCircle2 className="h-5 w-5 text-teal-600" />
                                ) : (
                                    <Circle className="h-5 w-5 text-gray-400" />
                                )}
                            </div>
                        )}
                        {index !== undefined && !onToggleSelect && <Badge className="bg-teal-600 text-white">{index + 1}</Badge>}
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
                                    className={`text-xs border-teal-300 text-teal-700 bg-teal-50 ${isAlreadyAdded ? "opacity-60" : ""}`}
                                >
                                    {question.category.name}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={`text-xs border-purple-300 text-purple-700 bg-purple-50 ${isAlreadyAdded ? "opacity-60" : ""}`}
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
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleQuestionExpansion(question.id, added)
                                }}
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer text-gray-500 hover:text-teal-700 hover:bg-teal-50 p-1"
                                title={isExpanded ? "Thu gọn" : "Xem đáp án"}
                            >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {isExpanded && question.answers.length > 0 && (
                    <div className="px-4 pb-4">
                        <div className="border-t border-gray-200 pt-3 mt-1">
                            <div className="grid grid-cols-1 gap-2 text-xs">
                                {question.answers.map((option) => (
                                    <div
                                        key={option.id}
                                        className={`p-3 rounded-lg transition-all duration-200 border ${
                                            option.correct
                                                ? "bg-teal-50 border-teal-300 text-teal-800 shadow-sm"
                                                : "bg-gray-50 border-gray-200 text-gray-700"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                      <span className={`font-semibold ${option.correct ? "text-teal-700" : "text-gray-600"}`}>
                        {String.fromCharCode(65 + option.id)}.
                      </span>
                                            <span>{option.name}</span>
                                            {option.correct && <CheckCircle2 className="h-4 w-4 ml-auto text-teal-600" />}
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
        <div className="min-h-screen bg-gray-50 p-2 pb-8">
            <div className="mx-auto max-w-full space-y-2 px-2">
                <div className="flex justify-between items-center pt-4">
                    <button
                        onClick={() => router.push("/users/dashboard")}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs bg-gray-700 text-white hover:bg-gray-600 border border-gray-500 cursor-pointer h-9 px-4 py-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-white">Quay lại</span>
                    </button>
                    <Button
                        onClick={formik.handleSubmit}
                        className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 font-semibold rounded-lg shadow-md transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                        disabled={isSubmitting}
                    >
                        <Save className="h-4 w-4" />
                        {isSubmitting ? "Đang lưu..." : "Lưu bài kiểm tra"}
                    </Button>
                </div>

                <div className="text-center py-1 pb-3">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
                        <Sparkles className="h-7 w-7 text-purple-600" />
                        Tạo Bài Kiểm Tra
                        <Zap className="h-7 w-7 text-teal-500" />
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6 flex flex-col">
                        <Card className="p-0 shadow-lg border-gray-200 bg-white">
                            <CardHeader className="bg-purple-600 text-white rounded-t-lg">
                                <CardTitle className="flex items-center gap-3 text-lg py-3">
                                    <BookOpen className="h-5 w-5" />
                                    Thông Tin Cơ Bản
                                    <Trophy className="h-4 w-4 ml-auto" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4 bg-white">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-gray-700 font-medium flex items-center gap-2">
                                        <Star className="h-4 w-4 text-teal-600" />
                                        Tiêu đề bài kiểm tra
                                    </Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="Nhập tiêu đề bài kiểm tra..."
                                        value={formik.values.title}
                                        onChange={formik.handleChange}
                                        className="border-gray-300 bg-gray-50 focus:border-teal-500 focus:ring-teal-500 focus:bg-white"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                                            <FaFireAlt className="h-4 w-4 text-purple-600" />
                                            Độ khó
                                        </Label>
                                        <Select
                                            value={formik.values.difficultyId === -1 ? "" : formik.values.difficultyId.toString()}
                                            onValueChange={(value) => formik.setFieldValue("difficultyId", value === "" ? -1 : Number(value))}
                                        >
                                            <SelectTrigger className="border-gray-300 bg-gray-50 focus:border-purple-500 focus:bg-white">
                                                <SelectValue placeholder="Chọn độ khó" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                {difficulties.map((diff) => (
                                                    <SelectItem key={diff.id} value={diff.id.toString()}>
                                                        {diff.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-teal-600" />
                                            Danh mục
                                        </Label>
                                        <Select
                                            value={formik.values.categoryId === -1 ? "" : formik.values.categoryId.toString()}
                                            onValueChange={(value) => formik.setFieldValue("categoryId", value === "" ? -1 : Number(value))}
                                            disabled={formik.values.questions.length > 0}
                                        >
                                            <SelectTrigger className="border-gray-300 bg-gray-50 focus:border-teal-500">
                                                <SelectValue placeholder="Chọn danh mục" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-purple-600" />
                                            Thời gian (phút)
                                        </Label>
                                        <Input
                                            type="number"
                                            value={formik.values.duration}
                                            onChange={(e) => formik.setFieldValue("duration", Number(e.target.value))}
                                            className="border-gray-300 bg-gray-50 focus:border-purple-500 focus:bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                                            <Target className="h-4 w-4 text-teal-600" />
                                            Điểm đạt (%)
                                        </Label>
                                        <Input
                                            type="number"
                                            value={formik.values.passScore}
                                            onChange={(e) => formik.setFieldValue("passScore", Number(e.target.value))}
                                            className="border-gray-300 bg-gray-50 focus:border-teal-500 focus:bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                                            <FaCircleQuestion className="h-4 w-4 text-purple-600" />
                                            Số lượng câu hỏi
                                        </Label>
                                        <Select
                                            value={formik.values.questionLimit.toString()}
                                            onValueChange={(value) => formik.setFieldValue("questionLimit", Number(value))}
                                            disabled={formik.values.questions.length > 0}
                                        >
                                            <SelectTrigger className="border-gray-300 bg-gray-50 focus:border-purple-500">
                                                <SelectValue placeholder="Chọn số câu" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                {questionLimits.map((limit) => (
                                                    <SelectItem key={limit.value} value={limit.value.toString()}>
                                                        {limit.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="p-0 shadow-lg border-gray-200 bg-white flex-1">
                            <CardHeader className="bg-teal-500 text-white rounded-t-lg">
                                <CardTitle className="flex items-center justify-between text-lg py-3">
                                    <div className="flex items-center gap-3">
                                        <ListIcon className="h-5 w-5" />
                                        Câu Hỏi Đã Chọn ({formik.values.questions.length})
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-white/20 text-white border-white/30">
                                            {formik.values.questions.length} / {formik.values.questionLimit === 10000 ? "∞" : formik.values.questionLimit}
                                        </Badge>
                                        {formik.values.questions.length > 0 && (
                                            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-white hover:bg-white/20 p-2"
                                                        title="Xóa tất cả câu hỏi"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="bg-white">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center gap-2 text-red-600">
                                                            <Trash2 className="h-5 w-5" />
                                                            Xác nhận xóa
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Bạn có chắc chắn muốn xóa tất cả {formik.values.questions.length} câu hỏi đã chọn không? Hành động này không thể hoàn tác.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter className="gap-2">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setShowDeleteDialog(false)}
                                                            className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                        >
                                                            Hủy
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={clearAllQuestions}
                                                            className="bg-red-600 hover:bg-red-700 text-white"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Xóa tất cả
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 bg-white flex-1 flex flex-col">
                                <div className="flex-1 overflow-y-auto max-h-96">
                                    {formik.values.questions.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6 flex flex-col">
                        <Card className="p-0 shadow-lg border-gray-200 bg-white">
                            <CardHeader className="bg-teal-500 text-white rounded-t-lg">
                                <CardTitle className="flex items-center gap-3 text-lg py-3">
                                    <Search className="h-5 w-5" />
                                    Ngân Hàng Câu Hỏi
                                    <Badge className="bg-white/20 text-white border-white/30 ml-auto">
                                        {`${selectedQuestion.length} đã chọn`}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3 bg-white">
                                <div className="flex flex-col md:flex-row gap-4 w-full">
                                    <div className="space-y-2 w-full md:w-auto flex-shrink-0">
                                        <Label className="text-gray-700 font-medium text-sm flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-teal-600" />
                                            Nguồn câu hỏi
                                        </Label>
                                        <Select value={questionSource} onValueChange={setQuestionSource}>
                                            <SelectTrigger className="border-gray-300 bg-gray-50 focus:border-teal-500">
                                                <SelectValue placeholder="Chọn nguồn câu hỏi" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                <SelectItem value={`${formik.values.authorId}`}>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        Câu hỏi của tôi
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value={"-1"}>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        Câu hỏi của người khác
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value={"999"}>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        Tất cả
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 w-full">
                                        <Label className="text-gray-700 font-medium text-sm flex items-center gap-2">
                                            <Search className="h-4 w-4 text-purple-600" />
                                            Tìm kiếm
                                        </Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Tìm kiếm theo username"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 border-gray-300 bg-gray-50 focus:border-teal-500 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {selectedQuestion.length > 0 && (
                                    <Button
                                        onClick={addSelectedQuestions}
                                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm {selectedQuestion.length} câu hỏi đã chọn
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="p-0 shadow-lg border-gray-200 bg-white flex-1">
                            <CardHeader className="bg-purple-600 text-white rounded-t-lg">
                                <CardTitle className="flex items-center justify-between text-lg py-3">
                                    <div className="flex items-center gap-3">
                                        <ListIcon className="h-5 w-5" />
                                        Danh Sách Câu Hỏi ({questionBank.length})
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 bg-white flex-1 flex flex-col">
                                <div className="flex-1 overflow-y-auto max-h-96 space-y-3">
                                    {questionBank.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
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