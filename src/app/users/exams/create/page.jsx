"use client"

import {forwardRef, useEffect, useRef, useState} from "react"
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
    Upload,
    ExternalLink,
    Edit,
    User,
    Zap,
    Save,
    Lock
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
import {FaCircleQuestion} from "react-icons/fa6"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../../../components/ui/dialog"
import * as ExcelJS from "exceljs"
import {ScrollArea} from "../../../../components/ui/scroll-area";
import TypeService from "../../../../services/TypeService";

const questionLimits = [
    {value: 30, label: "30 câu"},
    {value: 40, label: "40 câu"},
    {value: 50, label: "50 câu"},
    {value: 10000, label: "Không giới hạn"},
]

export default function CreateExam({id}) {
    const isEdit = id
    const router = useRouter()
    const [oldTitle, setOldTitle] = useState("")
    const [categories, setCategories] = useState([])
    const [difficulties, setDifficulties] = useState([])
    const [types, setTypes] = useState([])

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [questionBank, setQuestionBank] = useState([])
    const [selectedQuestion, setSelectedQuestion] = useState([])
    const [questionSource, setQuestionSource] = useState("-999")
    const [searchTerm, setSearchTerm] = useState("")
    const [questionsFromExcel, setQuestionsFromExcel] = useState([])

    const [expandedQuestions, setExpandedQuestions] = useState(new Map())
    const [userId, setUserId] = useState(Number(localStorage.getItem("id")))
    const [file, setFile] = useState(null)
    const [reload, setReload] = useState(false)

    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showImportDialog, setShowImportDialog] = useState(false)
    const [openQuestionsExcel, setOpenQuestionsExcel] = useState(false);
    const errorRefs = useRef([])
    const [currentErrorIndex, setCurrentErrorIndex] = useState(0)
    const [errorQuestionIds, setErrorQuestionIds] = useState([])

    const ExamSchema = Yup.object({
        title: Yup.string().required("Tiêu đề không được để trống"),
        difficultyId: Yup.number()
            .required("Thiếu độ khó bài thi")
            .test("not-default", "Hãy chọn một độ khó", (value) => value !== -1),
        categoryId: Yup.number()
            .required("Thiếu danh mục bài thi")
            .test("not-default", "Hãy chọn một thể loại", (value) => value !== -1),
        passScore: Yup.number()
            .required("Thiếu mức điểm để vượt qua bài thi")
            .min(1, "Tỉ lệ số câu đúng để đạt không thể âm")
            .max(100, "Tỉ lệ số câu đúng để đạt không thể lớn hơn 100%"),
        duration: Yup.number().min(1, "Thời gian không thê quá ngắn").required("Thiếu thời gian để làm bài thi"),
    })

    const formik = useFormik({
        initialValues: {
            title: "",
            authorId: -2,
            difficultyId: -1,
            categoryId: -1,
            duration: 30,
            passScore: 70,
            questionLimit: 10000,
            questions: [],
            isPublic: true,
        },
        validationSchema: ExamSchema,
        onSubmit: async (values) => {
            if (values.questionLimit < Math.max(...questionLimits.map((limit) => limit.value))) {
                if (values.questions.length < values.questionLimit) {
                    toast.warning("hãy thêm đủ số lượng câu hỏi")
                    return
                } else if (values.questions.length > values.questionLimit) {
                    toast.warning(`Bạn đang thừa ${values.questions.length - values.questionLimit} câu hỏi`)
                    return
                }
            }
            console.log(values)
            await handleSubmit(values)
        },
    })

    useEffect(() => {
        if (isEdit) fetchForEdit()
        formik.setFieldValue("authorId", userId)

        const fetchData = async () => {
            try {
                const resCategory = await CategoryService.getAll()
                setCategories(resCategory.data)

                const resDifficulty = await DifficultyService.getAll()
                setDifficulties(resDifficulty.data)
            } catch (error) {
                toast.error(error?.response?.data || "Lỗi khi fetch category hoặc difficulty")
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        const filterData = async () => {
            try {
                const resFilter = await QuestionService.filterByCategoryAndSource(
                    formik.values.categoryId,
                    questionSource,
                    userId,
                    searchTerm,
                )
                setQuestionBank(resFilter.data)
            } catch (error) {
                toast.error(error?.response?.data || "Lỗi khi fetch data")
            }
        }

        filterData()
    }, [formik.values.categoryId, questionSource, userId, searchTerm, reload])

    useEffect(() => {
        const countQuestions = formik.values.questions.length
        const countQuestionLimit = formik.values.questionLimit
        if (countQuestions > countQuestionLimit) {
            toast.warning(`Bạn đang thêm thừa ${countQuestions - countQuestionLimit} câu hỏi`)
        }
    }, [formik.values.questionLimit])

    useEffect(() => {
        if (file !== null) toast.info("File Added")
    }, [file])

    useEffect(() => {
        errorRefs.current = []
    }, [questionsFromExcel])

    const handleSubmit = async (values) => {
        setIsSubmitting(true)

        try {
            const titleChanged = isEdit && oldTitle !== values.title
            const shouldCheckDuplicate = titleChanged || !isEdit

            if (shouldCheckDuplicate) {
                const existRes = await ExamService.exist(values.title)
                const titleExists = existRes.data

                if (titleExists) {
                    toast.warning("Tên bài thi đã tồn tại")
                    setIsSubmitting(false)
                    return
                }
            }

            const {questions, ...rest} = values
            const params = {
                ...rest,
                questionIds: questions.map((q) => q.id),
            }

            const loadingMessage = isEdit ? "Đang cập nhật bài thi ..." : "Đang tạo bài thi ..."
            const idLoading = toast.loading(loadingMessage)

            if (isEdit) {
                const res = await ExamService.update(params, id)
                toast.success(res.data, {id: idLoading})
                router.push("/users/exams")
            } else {
                const res = await ExamService.create(params)
                toast.success(res.data, {id: idLoading})
                router.push("/users/exams")
            }
        } catch (error) {
            const errorMessage = error?.response?.data || error?.message || "Đã xảy ra lỗi"
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

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
                toast.error(err?.response?.data || "Lỗi khi lấy dữ liệu bài thi")
                router.push("/")
            })
    }

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

    const toggleQuestionExpansion = (questionId) => {
        setExpandedQuestions((prev) => {
            const newMap = new Map(prev)
            if (newMap.has(questionId)) {
                newMap.delete(questionId)
            } else {
                newMap.set(questionId)
            }
            return newMap
        })
    }

    const addSelectedQuestions = () => {
        const newQuestions = selectedQuestion.filter((q) => !isQuestionAlreadyAdded(q.id))
        const countQuestions = formik.values.questions.length
        const countQuestionLimit = formik.values.questionLimit

        if (countQuestions > countQuestionLimit) {
            toast.warning(`Đã vượt giới hạn ${countQuestions - countQuestions} câu hỏi`)
        } else if (countQuestions === countQuestionLimit) {
            toast.warning("Đã đạt số câu hỏi tối đa")
        } else {
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

    const handleEdit = async (question) => {
        const payload = {
            category: question.category.name,
            difficulty: question.difficulty.name,
            type: question.type.name,
            content: question.content,
            answers: question.answers,
        }

        try {
            await QuestionService.update(question.id, payload)
            router.push(`/users/questions/${question.id}/edit`)
        } catch (error) {
            const message = error?.response?.data
            toast.error(message)
        }
    }

    const handleDuration = (e) => {
        const value = e.target.value

        if (!value || isNaN(value)) {
            formik.setFieldValue("duration", "")
            return
        }
        formik.setFieldValue("duration", removeZeroStart(value))
    }

    const handlePassScore = (e) => {
        const value = e.target.value

        if (!value || isNaN(value)) {
            formik.setFieldValue("passScore", "")
            return
        }
        formik.setFieldValue("passScore", removeZeroStart(value))
    }

    const removeZeroStart = (value) => {
        while (value.toString().startsWith("0")) {
            value = value.substring(1, value.toString().length)
        }
        return value
    }

    const handleOpenNewTab = () => {
        window.open("/template", "_blank")
    }

    const handleFileChange = (e) => {
        const fetchTypes = async () => {
            try {
                const response = await TypeService.getAll();
                setTypes(response.data.map(type => type.name));
            } catch (error) {
                toast.error(error?.response?.data || "Lỗi khi fetch types")
            }
        }
        fetchTypes()
        setFile(e.target.files[0])
    }

    const handleReadFileExcel = async () => {
        try {
            if (!file) {
                toast.warning("Bạn chưa thêm file .xlsx")
                return
            }

            const arrayBuffer = await file.arrayBuffer()
            const workbook = new ExcelJS.Workbook()
            await workbook.xlsx.load(arrayBuffer)

            const worksheet = workbook.getWorksheet("Câu hỏi") || workbook.worksheets[0]

            const expectedKeys = [
                "content",
                "category",
                "difficulty",
                "type",
                "answer1",
                "answer2",
                "answer3",
                "answer4",
                "correct"
            ]

            const data = []

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return

                const values = row.values
                const rawItem = {}
                const errors = []

                for (let i = 1; i <= expectedKeys.length; i++) {
                    const value = values[i]
                    if (value !== undefined && value !== null && value !== "") {
                        rawItem[expectedKeys[i - 1]] = value.toString().trim()
                    }
                }

                if (!rawItem.content || !rawItem.correct) return

                const answers = []
                for (let i = 1; i <= 4; i++) {
                    const key = `answer${i}`
                    if (rawItem[key]) {
                        answers.push({
                            id: i - 1,
                            content: rawItem[key],
                            correct: rawItem.correct.split(",").map(c => c.trim()).includes(i.toString())
                        })
                    }
                }

                if (rawItem.category && !categories.map(category => category.name).includes(rawItem.category)) {
                    errors.push(`Danh mục không hợp lệ: "${rawItem.category}"`)
                }

                if (rawItem.difficulty && !difficulties.map(difficulty => difficulty.name).includes(rawItem.difficulty)) {
                    errors.push(`Độ khó không hợp lệ: "${rawItem.difficulty}"`)
                }

                if (rawItem.type && !types.includes(rawItem.type)) {
                    errors.push(`Loại câu hỏi không hợp lệ: "${rawItem.type}"`)
                }

                const correctCount = answers.filter((a) => a.correct).length

                if (rawItem.type === types[1] && correctCount !== 1) {
                    errors.push("Câu hỏi một lựa chọn phải có duy nhất 1 đáp án đúng")
                }

                if (rawItem.type === types[2]) {
                    if (answers.length !== 2) {
                        errors.push("Câu hỏi Đúng/Sai phải có đúng 2 đáp án")
                    }
                    if (correctCount !== 1) {
                        errors.push("Câu hỏi Đúng/Sai phải có đúng 1 đáp án đúng")
                    }
                }

                const item = {
                    content: rawItem.content,
                    category: rawItem.category || "",
                    difficulty: rawItem.difficulty || "",
                    type: rawItem.type || "",
                    answers,
                    ...(errors.length > 0 ? {errors} : {})
                }

                data.push(item)
            })

            const result = data.map(q => {
                return {...q, id: -data.indexOf(q)}
            })

            setErrorQuestionIds(result.filter((q) => q.errors?.length > 0).map((q) => q.id))
            setOpenQuestionsExcel(true)
            setShowImportDialog(false);
            setFile(null);
            await setQuestionsFromExcel(result)
        } catch (error) {
            console.error("❌ Lỗi khi đọc file Excel:", error)
        }
    }

    const handleImportQuestions = async () => {
        try {
            setIsSubmitting(true)
            const response = await QuestionService.import(questionsFromExcel, userId)
            toast.success(response?.data || `Thêm thành công ${questionsFromExcel.length} câu hỏi`)
            setQuestionsFromExcel([]);
            setOpenQuestionsExcel(false);
        } catch (error) {
            toast.error(error?.response?.data || "Lỗi khi tải lên danh sách câu hỏi")
        } finally {
            setIsSubmitting(false);
        }
    }

    const scrollToError = (index) => {
        const el = errorRefs.current[index]
        if (el) {
            el.scrollIntoView({behavior: "smooth", block: "center"})
            setCurrentErrorIndex(index)
        }
    }

    const handlePrevError = () => {
        if (currentErrorIndex > 0) scrollToError(currentErrorIndex - 1)
    }

    const handleNextError = (e) => {
        if (currentErrorIndex < errorRefs.current.length - 1) scrollToError(currentErrorIndex + 1)
    }

    const QuestionCard = ({question, index, showRemove = false, onRemove, onToggleSelect}, ref) => {
        const isExpanded = expandedQuestions.has(question.id)
        const isToggleSelected = selectedQuestion.find((q) => q.id === question.id) !== undefined
        const isAlreadyAdded = isQuestionAlreadyAdded(question.id)

        return (
            <div ref={ref} className={`border-2 rounded-lg transition-all duration-300 shadow-sm ${
                errorQuestionIds.includes(question.id) ? "bg-white border-red-600 hover:shadow-md"
                    : isAlreadyAdded
                        ? "bg-gray-100 border-gray-200 opacity-80"
                        : isToggleSelected
                            ? "bg-teal-100 border-teal-400 shadow-md"
                            : "bg-white border-gray-200 hover:border-teal-300 hover:shadow-md"
            }`}>
                <div
                    className={`p-4 ${!isAlreadyAdded && onToggleSelect ? "cursor-pointer" : ""}`}
                    onClick={!isAlreadyAdded && onToggleSelect ? () => onToggleSelect(question.id) : undefined}
                >
                    <div className="flex items-start gap-3">
                        {!openQuestionsExcel &&
                            <div className="mt-1">
                                {isAlreadyAdded ? (
                                    <CheckCircle2 className="h-5 w-5 text-gray-400"/>
                                ) : isToggleSelected ? (
                                    <CheckCircle2 className="h-5 w-5 text-teal-600"/>
                                ) : (
                                    <Circle className="h-5 w-5 text-gray-400"/>
                                )}
                            </div>
                        }
                        {index !== undefined && !onToggleSelect &&
                            <Badge className="bg-teal-600 text-white">{index < 0 ? -index + 1 : index + 1}</Badge>}
                        <div className="flex-1">
                            <h4 className={`font-medium text-sm mb-3 text-gray-800 ${isAlreadyAdded ? "opacity-50" : ""}`}>
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
                                    {question.category.name || question.category}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={`text-xs border-purple-300 text-purple-700 bg-purple-50 ${isAlreadyAdded ? "opacity-60" : ""}`}
                                >
                                    {question.difficulty.name || question.difficulty}
                                </Badge>
                                {!openQuestionsExcel &&
                                    <Badge
                                        variant="outline"
                                        className={`text-xs border-gray-300 text-gray-600 ${isAlreadyAdded ? "opacity-60" : ""}`}
                                    >
                                        {question?.user?.id === userId ? "tôi" : question?.user?.username}
                                    </Badge>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleQuestionExpansion(question.id)
                                }}
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer text-gray-500 hover:text-teal-700 hover:bg-teal-50 p-1 transition-all duration-200"
                                title={isExpanded ? "Thu gọn" : "Xem đáp án"}
                            >
                                {isExpanded ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
                            </Button>
                            {!openQuestionsExcel && question?.user?.id === userId && (
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleEdit(question)
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="cursor-pointer text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1 transition-all duration-200"
                                    title="Chỉnh sửa câu hỏi"
                                >
                                    <Edit className="h-4 w-4"/>
                                </Button>
                            )}
                            {!openQuestionsExcel && showRemove && onRemove && (
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onRemove(question.id)
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="cursor-pointer text-red-500 hover:text-red-700 hover:bg-red-50 p-1 transition-all duration-200"
                                >
                                    <Trash2 className="h-4 w-4"/>
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
                      <span className={`font-semibold ${option.correct ? "text-teal-700" : "text-gray-600"}`}></span>
                                            <span>{option.content}</span>
                                            {option.correct &&
                                                <CheckCircle2 className="h-4 w-4 ml-auto text-teal-600"/>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {Array.isArray(question.errors) && question.errors.length > 0 && (
                            <div className="px-4 pb-4">
                                <div className="pt-2">
                                    <div className="bg-red-50 border border-red-300 rounded-lg p-3">
                                        <h5 className="text-sm font-semibold text-red-700 mb-1">🛑 Lỗi:</h5>
                                        <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
                                            {question.errors.map((err, idx) => (
                                                <li key={idx}>{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

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
                        onClick={() => router.back()}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs bg-gray-700 text-white hover:bg-gray-600 border border-gray-500 cursor-pointer h-9 px-4 py-2"
                    >
                        <ArrowLeft className="w-4 h-4"/>
                        <span className="text-white">Quay lại</span>
                    </button>
                    <Button
                        onClick={() => formik.handleSubmit()}
                        className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 font-semibold rounded-lg shadow-md transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                        disabled={isSubmitting}
                    >
                        <Save className="h-4 w-4"/>
                        {isSubmitting ? "Đang lưu..." : id ? "Cập nhật bài kiểm tra" : "Lưu bài kiểm tra"}
                    </Button>
                </div>

                <div className="text-center py-1 pb-3">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
                        <Sparkles className="h-7 w-7 text-purple-600"/>
                        Tạo Bài Kiểm Tra
                        <Zap className="h-7 w-7 text-teal-500"/>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6 flex flex-col">
                        <Card className="p-0 shadow-lg border-gray-200 bg-white">
                            <CardHeader className="bg-purple-600 text-white rounded-t-lg">
                                <CardTitle className="flex items-center gap-3 text-lg py-3">
                                    <BookOpen className="h-5 w-5"/>
                                    Thông Tin Cơ Bản
                                    <Trophy className="h-4 w-4 ml-auto"/>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4 bg-white">
                                <div className="space-y-2">
                                    <Label htmlFor="title"
                                           className="text-gray-700 font-medium flex items-center gap-2">
                                        <Star className="h-4 w-4 text-teal-600"/>
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
                                    {formik.touched.title && formik.errors.title && (
                                        <div className="text-red-500 text-sm mt-1">{formik.errors.title}</div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                                            <FaFireAlt className="h-4 w-4 text-purple-600"/>
                                            Độ khó
                                        </Label>
                                        <Select
                                            value={formik.values.difficultyId === -1 ? "" : formik.values.difficultyId.toString()}
                                            onValueChange={(value) => formik.setFieldValue("difficultyId", value === "" ? -1 : Number(value))}
                                        >
                                            <SelectTrigger
                                                className="w-full border-gray-300 bg-gray-50 focus:border-purple-500 focus:bg-white cursor-pointer transition-all duration-200 hover:bg-gray-100">
                                                <SelectValue placeholder="Chọn độ khó"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                {difficulties.map((diff) => (
                                                    <SelectItem
                                                        key={diff.id}
                                                        value={diff.id.toString()}
                                                        className="hover:bg-gray-100 cursor-pointer transition-all duration-200"
                                                    >
                                                        {diff.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formik.touched.difficultyId && formik.errors.difficultyId && (
                                            <div
                                                className="text-red-500 text-sm mt-1">{formik.errors.difficultyId}</div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-teal-600"/>
                                            Danh mục
                                        </Label>
                                        <Select
                                            value={formik.values.categoryId === -1 ? "" : formik.values.categoryId.toString()}
                                            onValueChange={(value) => formik.setFieldValue("categoryId", value === "" ? -1 : Number(value))}
                                            disabled={formik.values.questions.length > 0}
                                        >
                                            <SelectTrigger
                                                className="w-full border-gray-300 bg-gray-50 focus:border-teal-500 cursor-pointer transition-all duration-200 hover:bg-gray-100">
                                                <SelectValue placeholder="Chọn danh mục"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                {categories.map((category) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={category.id.toString()}
                                                        className="hover:bg-gray-100 cursor-pointer transition-all duration-200"
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formik.touched.categoryId && formik.errors.categoryId && (
                                            <div className="text-red-500 text-sm mt-1">{formik.errors.categoryId}</div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                                            <FaCircleQuestion className="h-4 w-4 text-purple-600"/>
                                            Số lượng câu hỏi
                                        </Label>
                                        <Select
                                            value={formik.values.questionLimit}
                                            onValueChange={(value) => formik.setFieldValue("questionLimit", Number(value))}
                                        >
                                            <SelectTrigger
                                                className="w-full border-gray-300 bg-gray-50 focus:border-purple-500 cursor-pointer transition-all duration-200 hover:bg-gray-100">
                                                <SelectValue placeholder="Chọn số câu"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                {questionLimits.map((limit) => (
                                                    <SelectItem
                                                        key={limit.value}
                                                        value={limit.value}
                                                        className="hover:bg-gray-100 cursor-pointer transition-all duration-200"
                                                    >
                                                        {limit.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-purple-600"/>
                                            Thời gian (phút)
                                        </Label>
                                        <Input
                                            type="number"
                                            value={formik.values.duration}
                                            onChange={handleDuration}
                                            className="border-gray-300 bg-gray-50 focus:border-purple-500 focus:ring-purple-500 focus:bg-white h-10"
                                        />
                                        {formik.touched.duration && formik.errors.duration && (
                                            <div className="text-red-500 text-sm mt-1">{formik.errors.duration}</div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                                            <Target className="h-4 w-4 text-teal-600"/>
                                            Điểm đạt (%)
                                        </Label>
                                        <Input
                                            type="number"
                                            value={formik.values.passScore}
                                            onChange={handlePassScore}
                                            className="border-gray-300 bg-gray-50 focus:border-purple-500 focus:ring-purple-500 focus:bg-white h-10"
                                        />
                                        {formik.touched.passScore && formik.errors.passScore && (
                                            <div className="text-red-500 text-sm mt-1">{formik.errors.passScore}</div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                                            {formik.values.isPublic ? (
                                                <Globe className="h-4 w-4 text-teal-600"/>
                                            ) : (
                                                <Lock className="h-4 w-4 text-gray-500"/>
                                            )}
                                            Chế độ hiển thị
                                        </Label>

                                        <div
                                            className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-md px-3 h-10"
                                        >
                                            {formik.values.isPublic ? (
                                                <>
                                                    <span>Công khai</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Riêng tư</span>
                                                </>
                                            )}
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={formik.values.isPublic}
                                                onClick={() => formik.setFieldValue("isPublic", !formik.values.isPublic)}
                                                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                                                    formik.values.isPublic ? "bg-teal-600" : "bg-gray-300"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        formik.values.isPublic ? "translate-x-5" : "translate-x-1"
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="p-0 shadow-lg border-gray-200 bg-white flex-1">
                            <CardHeader className="bg-teal-500 text-white rounded-t-lg">
                                <CardTitle className="flex items-center justify-between text-lg py-3">
                                    <div className="flex items-center gap-3">
                                        <ListIcon className="h-5 w-5"/>
                                        Câu Hỏi Đã Chọn ({formik.values.questions.length})
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-white/20 text-white border-white/30">
                                            {formik.values.questions.length} /{" "}
                                            {formik.values.questionLimit === 10000 ? "∞" : formik.values.questionLimit}
                                        </Badge>
                                        {formik.values.questions.length > 0 && (
                                            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-white hover:bg-white/20 p-2 cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                                                        title="Xóa tất cả câu hỏi"
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="bg-white">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center gap-2 text-red-600">
                                                            <Trash2 className="h-5 w-5"/>
                                                            Xác nhận xóa
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Bạn có chắc chắn muốn xóa tất
                                                            cả {formik.values.questions.length} câu hỏi đã chọn không?
                                                            Hành động này không thể hoàn tác.
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
                                                            <Trash2 className="h-4 w-4 mr-2"/>
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
                                    <Search className="h-5 w-5"/>
                                    Ngân Hàng Câu Hỏi
                                    <div className="flex items-center gap-2 ml-auto">
                                        <Badge className="bg-white/20 text-white border-white/30">
                                            {`${selectedQuestion.length} đã chọn`}
                                        </Badge>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3 bg-white">
                                <div className="flex flex-col md:flex-row gap-4 w-full items-end">
                                    <div className="space-y-2 w-full md:w-auto flex-shrink-0">
                                        <Label className="text-gray-700 font-medium text-sm flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-teal-600"/>
                                            Nguồn câu hỏi
                                        </Label>
                                        <Select value={questionSource}
                                                onValueChange={(value) => {
                                                    if (value !== "-555") setQuestionSource(value)
                                                    else setShowImportDialog(true)
                                                }}>
                                            <SelectTrigger
                                                className="w-full border-gray-300 bg-gray-50 focus:border-teal-500 cursor-pointer transition-all duration-200 hover:bg-gray-100">
                                                <SelectValue placeholder="Chọn nguồn câu hỏi"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                <SelectItem
                                                    value={`${formik.values.authorId}`}
                                                    className="hover:bg-gray-100 cursor-pointer transition-all duration-200"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4"/>
                                                        Câu hỏi của tôi
                                                    </div>
                                                </SelectItem>
                                                <SelectItem
                                                    value={"-1"}
                                                    className="hover:bg-gray-100 cursor-pointer transition-all duration-200"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4"/>
                                                        Câu hỏi của người khác
                                                    </div>
                                                </SelectItem>
                                                <SelectItem
                                                    value={"-999"}
                                                    className="hover:bg-gray-100 cursor-pointer transition-all duration-200"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4"/>
                                                        Tất cả
                                                    </div>
                                                </SelectItem>
                                                <SelectItem
                                                    value={"-555"}
                                                    className="hover:bg-gray-100 cursor-pointer transition-all duration-200"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4"/>
                                                        Nhập câu hỏi từ Excel
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 w-full">
                                        <Label className="text-gray-700 font-medium text-sm flex items-center gap-2">
                                            <Search className="h-4 w-4 text-purple-600"/>
                                            Tìm kiếm
                                        </Label>
                                        <div className="relative">
                                            <Search
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                                            <Input
                                                placeholder="Tìm kiếm theo tên người dùng"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 border-gray-300 bg-gray-50 focus:border-teal-500 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 w-full md:w-auto flex-shrink-0">
                                        {/*<Label className="text-gray-700 font-medium text-sm flex items-center gap-2">*/}
                                        {/*    <Upload className="h-4 w-4 text-purple-600"/>*/}
                                        {/*    Tải lên*/}
                                        {/*</Label>*/}
                                        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                                            {/*<DialogTrigger asChild>*/}
                                            {/*    <Button*/}
                                            {/*        variant="outline"*/}
                                            {/*        className="w-full cursor-pointer bg-white text-purple-600 border-purple-300 hover:bg-purple-50 transition-all duration-200 disabled:cursor-not-allowed"*/}
                                            {/*        title="Import câu hỏi từ Excel"*/}
                                            {/*    >*/}
                                            {/*        <Upload className="h-4 w-4 mr-2"/>*/}
                                            {/*        File Excel*/}
                                            {/*    </Button>*/}
                                            {/*</DialogTrigger>*/}

                                            <DialogContent className="bg-white max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-2 text-purple-600">
                                                        <Upload className="h-5 w-5"/>
                                                        Nhập Câu Hỏi từ file Excel
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Tải lên file Excel chứa danh sách câu hỏi để nhập nhanh vào hệ
                                                        thống.
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <div className="space-y-4">
                                                    <label htmlFor="excel-upload">
                                                        <div
                                                            className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                                                            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4"/>
                                                            {file ? (
                                                                <p className="text-gray-600 font-medium">{file.name}</p>
                                                            ) : (
                                                                <>
                                                                    <p className="text-gray-600 mb-2">Kéo thả file Excel
                                                                        vào đây</p>
                                                                    <p className="text-sm text-gray-500">hoặc click để
                                                                        chọn file</p>
                                                                </>
                                                            )}

                                                            <input
                                                                id="excel-upload"
                                                                type="file"
                                                                accept=".xlsx"
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                onChange={handleFileChange}
                                                            />
                                                        </div>
                                                    </label>

                                                    <div className="flex justify-center mt-4">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="cursor-pointer bg-white text-purple-600 border-purple-300 hover:bg-purple-50 flex items-center gap-2"
                                                            onClick={handleOpenNewTab}
                                                        >
                                                            <ExternalLink className="h-4 w-4"/>
                                                            Xem mẫu Excel
                                                        </Button>
                                                    </div>
                                                </div>

                                                <DialogFooter className="gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setShowImportDialog(false)}
                                                        className="cursor-pointer bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                    >
                                                        Hủy
                                                    </Button>
                                                    <Button
                                                        className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white"
                                                        onClick={handleReadFileExcel}
                                                        disabled={isSubmitting}
                                                    >
                                                        <Upload className="h-4 w-4 mr-2"/>
                                                        Đọc File
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog open={openQuestionsExcel} onOpenChange={setOpenQuestionsExcel}>
                                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-white">
                                                <DialogHeader>
                                                    <div className="flex items-center justify-between">
                                                        <DialogTitle className="text-lg font-bold text-teal-700">Danh
                                                            sách câu hỏi</DialogTitle>

                                                        {/*{errorQuestionIds.length > 0 && (*/}
                                                        {/*    <div*/}
                                                        {/*        className="flex items-center gap-2 bg-red-100 border border-red-300 px-3 py-1 rounded-lg">*/}
                                                        {/*        <span className="text-sm font-semibold text-red-800">Đến câu hỏi lỗi</span>*/}
                                                        {/*        <Button*/}
                                                        {/*            size="icon"*/}
                                                        {/*            variant="ghost"*/}
                                                        {/*            className="cursor-pointer text-red-600 hover:bg-red-200 p-1"*/}
                                                        {/*            onClick={handlePrevError}*/}
                                                        {/*            title="Tới lỗi trước"*/}
                                                        {/*            disabled={currentErrorIndex < 1}*/}
                                                        {/*        >*/}
                                                        {/*            <ChevronUp className="h-4 w-4"/>*/}
                                                        {/*        </Button>*/}
                                                        {/*        <Button*/}
                                                        {/*            size="icon"*/}
                                                        {/*            variant="ghost"*/}
                                                        {/*            className="cursor-pointer text-red-600 hover:bg-red-200 p-1"*/}
                                                        {/*            onClick={handleNextError}*/}
                                                        {/*            title="Tới lỗi tiếp theo"*/}
                                                        {/*        >*/}
                                                        {/*            <ChevronDown className="h-4 w-4"/>*/}
                                                        {/*        </Button>*/}
                                                        {/*    </div>*/}
                                                        {/*)}*/}
                                                    </div>
                                                </DialogHeader>

                                                <ScrollArea className="h-[70vh] pr-2">
                                                    <div className="space-y-4 mt-2">
                                                        {questionsFromExcel.length === 0 ? (
                                                            <p className="text-center text-gray-500 text-sm">Chưa có câu
                                                                hỏi nào.</p>
                                                        ) : (
                                                            questionsFromExcel.map((q) => {
                                                                    const hasError = (q.errors !== undefined) && q.errors.length > 0;
                                                                    return (
                                                                        <QuestionCard
                                                                            key={questionsFromExcel.indexOf(q)}
                                                                            question={q}
                                                                            index={-questionsFromExcel.indexOf(q)}
                                                                            userId={userId}
                                                                            expandedQuestions={new Set()}
                                                                            selectedQuestion={[]}
                                                                            isQuestionAlreadyAdded={() => false}
                                                                            ref={(el) => {
                                                                                if (hasError && el) {
                                                                                    errorRefs.current.push(el)
                                                                                }
                                                                            }}
                                                                        />
                                                                    )
                                                                }
                                                            ))}
                                                    </div>
                                                </ScrollArea>

                                                {questionsFromExcel.length > 0 &&
                                                    questionsFromExcel.every((q) => !(q.errors?.length > 0)) && (
                                                        <div className="flex justify-end mt-4">
                                                            <Button onClick={handleImportQuestions}
                                                                    className="bg-teal-600 text-white hover:bg-teal-700"
                                                                    disabled={isSubmitting}
                                                            >
                                                                Tải lên {questionsFromExcel.length} câu hỏi
                                                            </Button>
                                                        </div>
                                                    )}
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                                {selectedQuestion.length > 0 && (
                                    <Button
                                        onClick={addSelectedQuestions}
                                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="h-4 w-4 mr-2"/>
                                        Thêm {selectedQuestion.length} câu hỏi đã chọn
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="p-0 shadow-lg border-gray-200 bg-white flex-1">
                            <CardHeader className="bg-purple-600 text-white rounded-t-lg">
                                <CardTitle className="flex items-center justify-between text-lg py-3">
                                    <div className="flex items-center gap-3">
                                        <ListIcon className="h-5 w-5"/>
                                        Danh Sách Câu Hỏi ({questionBank.length})
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 bg-white flex-1 flex flex-col">
                                <div className="flex-1 overflow-y-auto max-h-96 space-y-3">
                                    {questionBank.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <Search className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                                            <p>Không tìm thấy câu hỏi nào</p>
                                        </div>
                                    ) : (
                                        questionBank.map((question) => (
                                            <QuestionCard
                                                key={question.id}
                                                question={question}
                                                onToggleSelect={toggleQuestionSelection}
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
