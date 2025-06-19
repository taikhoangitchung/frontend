"use client"

import {useEffect, useState} from "react"
import {Input} from "../../../../components/ui/input"
import {Label} from "../../../../components/ui/label"
import {Card, CardContent, CardHeader, CardTitle} from "../../../../components/ui/card"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../../../components/ui/select"
import {Badge} from "../../../../components/ui/badge"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "../../../../components/ui/dialog"
import {
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
import {Button} from "../../../../components/ui/button";
import {FaFireAlt} from "react-icons/fa";
import {MdOutlineZoomInMap} from "react-icons/md";
import CategoryService from "../../../../services/CategoryService";
import DifficultyService from "../../../../services/DifficultyService";
import {useFormik} from "formik";
import * as Yup from "yup";
import {toast} from "sonner";
import QuestionService from "../../../../services/QuestionService";

const questionLimits = [
    {value: 2, label: "2 câu"},
    {value: 20, label: "20 câu"},
    {value: 40, label: "40 câu"},
    {value: 45, label: "45 câu"},
    {value: 10000, label: "Không giới hạn"},
]

export default function CreateExam() {
    const [userId, setUserId] = useState(-1);
    const [categories, setCategories] = useState([]);
    const [difficulties, setDifficulties] = useState([]);

    const [questionBank, setQuestionBank] = useState([])
    const [selectedQuestion, setSelectedQuestion] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([])
    const [questionSource, setQuestionSource] = useState("-1")
    const [searchTerm, setSearchTerm] = useState("")

    // Popup states
    const [isSelectedQuestionsPopupOpen, setIsSelectedQuestionsPopupOpen] = useState(false)
    const [isQuestionBankPopupOpen, setIsQuestionBankPopupOpen] = useState(false)

    // Expanded questions state
    const [expandedQuestions, setExpandedQuestions] = useState(new Map())

    const ExamSchema = Yup.object({
        title: Yup.string().required("Title không được để trống"),
        difficulty: Yup.string().required("Difficulty không được để trống"),
        category: Yup.string().required("Category không được để trống"),
        questions: Yup.array().of(Yup.string().required('Không được để trống'))
            .min(1, 'Cần ít nhất 1 question'),
    })

    const formik = useFormik({
        initialValues: {
            title: "",
            difficulty: "",
            category: "",
            duration: 30,
            passScore: 70,
            questionLimit: 20,
            questions: []
        },
        onSubmit: (values) => {
            console.log(values);
        }
    })

    useEffect(() => {
        const userId = localStorage.getItem("id");
        setUserId(2);
        CategoryService.getAll()
            .then(res => setCategories(res.data))
            .catch(err => toast.error(err.toString));
        DifficultyService.getAll()
            .then(res => setDifficulties(res.data))
            .catch(err => toast.error(err.toString));
        QuestionService.getAll()
            .then(res => {
                setQuestionBank([...res.data])
                setFilteredQuestions([...res.data])
            })
            .catch(err => toast.error(err.toString));
    }, []);

    // Filter questions based on source, category, and search
    // const filteredQuestions = questionBank.filter((question) => {
    //     const matchesSource = question.user.id.toString() === questionSource;
    //
    //     const matchesCategory = question.category.id === formik.values.category.id
    //
    //     const matchesSearch =
    //         question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         question.category.toLowerCase().includes(searchTerm.toLowerCase())
    //
    //     return matchesSource && matchesCategory && matchesSearch
    // })

    const toggleQuestionSelection = (questionId) => {
        if (selectedQuestion.find(q => q.id === questionId) === undefined) {
            setSelectedQuestion([...selectedQuestion,questionBank.find(q => q.id === questionId)]);
        } else {
            setSelectedQuestion([...selectedQuestion.filter(q => q.id !== questionId)]);
        }
    }

    const toggleQuestionExpansion = (questionId, added) => {
        setExpandedQuestions((prev) => {
            const newMap = new Map(prev);
            if (newMap.has(questionId)) {
                newMap.delete(questionId);
            } else {
                newMap.set(questionId, {added: added});
            }
            return newMap;
        });
    }

    const addSelectedQuestions = () => {
        formik.setFieldValue("questions",
            [...formik.values.questions, ...selectedQuestion])
        setSelectedQuestion([]);
    }

    const removeQuestion = (id) => {
        formik.setFieldValue("questions", [...formik.values.questions.filter((q) => q.id !== id)])
    }

    // Question Card Component for reuse
    const QuestionCard = ({
                              question, index, showRemove = false, onRemove,
                              onToggleSelect, isInPopup = false, displayAdded
                          }) => {
        const added = formik.values.questions.find(q => q.id === question.id) !== undefined;
        const isExpanded = expandedQuestions.has(question.id) && (added === displayAdded);
        const isToggleSelected = selectedQuestion.find(q => q.id === question.id) !== undefined
        console.log(isToggleSelected);

        return (
            <div
                className={`border rounded-lg transition-all duration-300 ${
                    isToggleSelected
                        ? "bg-gradient-to-r from-green-500/20 to-teal-500/20 border-green-400"
                        : isInPopup
                            ? "bg-gray-50 border-gray-200 hover:bg-gray-100"
                            : "bg-white/10 border-white/20 hover:bg-white/20"
                }`}
            >
                {/* Header - Always visible */}
                <div className={`p-4 ${isToggleSelected ? "cursor-pointer" : ""}`}
                     onClick={isToggleSelected ? () => onToggleSelect(question.id) : undefined}
                >
                    <div className="flex items-start gap-3">
                        {!displayAdded && (
                            <div className="mt-1">
                                {isToggleSelected ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-400"/>
                                ) : (
                                    <Circle className="h-5 w-5 text-gray-400"/>
                                )}
                            </div>
                        )}
                        {index !== undefined && !onToggleSelect && (
                            <Badge
                                className={`${isInPopup ? "bg-purple-500" : "bg-gradient-to-r from-purple-500 to-pink-500"} text-white`}
                            >
                                {index + 1}
                            </Badge>
                        )}
                        <div className="flex-1">
                            <h4 className={`font-medium text-sm mb-3 ${isInPopup ? "text-gray-800" : "text-white"}`}>
                                {question.content}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${isInPopup ? "border-gray-300 text-gray-600" : "border-white/30 text-gray-300"}`}
                                >
                                    {question.category.name}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${isInPopup ? "border-gray-300 text-gray-600" : "border-white/30 text-gray-300"}`}
                                >
                                    {question.difficulty.name}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${isInPopup ? "border-gray-300 text-gray-600" : "border-white/30 text-gray-300"}`}
                                >
                                    {question.author}
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
                                className={`${
                                    isInPopup
                                        ? "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                                        : "text-gray-300 hover:text-white hover:bg-white/20"
                                } p-1`}
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
                                    className={`${
                                        isInPopup
                                            ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                                            : "text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                    } p-1`}
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
                        <div className="border-t pt-3 mt-1">
                            <div className="grid grid-cols-1 gap-2 text-xs">
                                {question.answers
                                    .map((option) => (
                                        <div
                                            key={option.id}
                                            className={`p-3 rounded-lg transition-all duration-200 ${
                                                option.correct
                                                    ? isInPopup
                                                        ? "bg-green-100 border-2 border-green-300 text-green-800 shadow-sm"
                                                        : "bg-green-500/20 border-2 border-green-400 text-green-300 shadow-lg"
                                                    : isInPopup
                                                        ? "bg-white border border-gray-200 text-gray-700"
                                                        : "bg-white/10 border border-white/20 text-gray-300"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                        <span
                            className={`font-semibold ${
                                option.correct
                                    ? isInPopup
                                        ? "text-green-700"
                                        : "text-green-200"
                                    : isInPopup
                                        ? "text-gray-600"
                                        : "text-gray-400"
                            }`}
                        >
                          {String.fromCharCode(65 + option.id)}.
                        </span>
                                                <span>{option.name}</span>
                                                {option.correct && (
                                                    <CheckCircle2
                                                        className={`h-4 w-4 ml-auto ${isInPopup ? "text-green-600" : "text-green-400"}`}
                                                    />
                                                )}
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="text-center space-y-4 py-8">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                            <Sparkles className="h-8 w-8 text-white"/>
                        </div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                            Tạo Bài Kiểm Tra
                        </h1>
                        <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                            <Zap className="h-8 w-8 text-white"/>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Exam Creation */}
                    <div className="space-y-6">
                        {/* Basic Info Card */}
                        <Card className="p-0 border-0 shadow-2xl bg-white/10 backdrop-blur-xl border-white/20 gap-0">
                            <CardHeader
                                className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white rounded-t-lg">
                                <CardTitle className="flex items-center gap-3 text-xl p-4">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <BookOpen className="h-6 w-6"/>
                                    </div>
                                    Thông Tin Cơ Bản
                                    <Trophy className="h-5 w-5 ml-auto"/>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                <div className="space-y-3">
                                    <Label htmlFor="title" className="text-white font-medium flex items-center gap-2">
                                        <Star className="h-4 w-4 text-yellow-400"/>
                                        Tiêu đề bài kiểm tra
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="Nhập tiêu đề siêu cool..."
                                        value={formik.values.title}
                                        onChange={formik.handleChange}
                                        className="border-2 border-white/30 bg-white/10 text-white placeholder:text-gray-300 focus:border-yellow-400 focus:bg-white/20 transition-all duration-300 h-10"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2 md:col-span-1">
                                        <Label className="text-white font-medium h-6 flex items-center">
                                            <FaFireAlt className="h-4 w-4 text-purple-400"/>
                                            Độ khó
                                        </Label>
                                        <Select
                                            value={formik.values.difficulty}
                                            onValueChange={(value) => formik.setFieldValue("difficulty", value)}>
                                            <SelectTrigger
                                                className="border-2 border-white/30 bg-white/10 text-white focus:border-yellow-400 w-full h-10">
                                                <SelectValue placeholder="Chọn độ khó"/>
                                            </SelectTrigger>
                                            <SelectContent className={"bg-purple-800 text-white"}>
                                                {difficulties.map((diff) => (
                                                    <SelectItem key={diff.id} value={diff.name}
                                                                className={"cursor-pointer"}>
                                                        <div className="flex items-center gap-2">
                                                            {diff.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-white font-medium h-6 flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-purple-400"/>
                                            Danh mục
                                        </Label>
                                        <Select
                                            value={formik.values.category}
                                            onValueChange={(value) => formik.setFieldValue("category", value)}
                                        >
                                            <SelectTrigger
                                                className="border-2 border-white/30 bg-white/10 text-white focus:border-purple-400 w-full h-10">
                                                <SelectValue placeholder="Chọn danh mục"/>
                                            </SelectTrigger>
                                            <SelectContent className={"bg-purple-800 text-white"}>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.name}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium h-6 flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-blue-400"/>
                                            Thời gian (phút)
                                        </Label>
                                        <Input
                                            type="number"
                                            value={formik.values.duration}
                                            onChange={formik.handleChange}
                                            className="border-2 border-white/30 bg-white/10 text-white focus:border-blue-400 focus:bg-white/20 h-10"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white font-medium h-6 flex items-center gap-2">
                                            <Target className="h-4 w-4 text-green-400"/>
                                            Điểm đạt (%)
                                        </Label>
                                        <Input
                                            type="number"
                                            value={formik.values.passScore}
                                            onChange={formik.handleChange}
                                            className="border-2 border-white/30 bg-white/10 text-white focus:border-green-400 focus:bg-white/20 h-10"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white font-medium h-6 flex items-center">Số lượng câu
                                            hỏi</Label>
                                        <Select
                                            value={formik.values.questionLimit}
                                            onValueChange={(value) => formik.setFieldValue('questionLimit', value)}
                                        >
                                            <SelectTrigger
                                                className="border-2 border-white/30 bg-white/10 text-white focus:border-yellow-400 w-full h-10">
                                                <SelectValue placeholder="Chọn số câu"/>
                                            </SelectTrigger>
                                            <SelectContent className={"bg-purple-800 text-white"}>
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
                        <Card className="p-0 border-0 shadow-2xl bg-white/10 backdrop-blur-xl border-white/20 gap-0">
                            <CardHeader
                                className="bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 text-white rounded-t-lg">
                                <CardTitle className="flex items-center justify-between text-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <ListIcon className="h-6 w-6"/>
                                        </div>
                                        Câu Hỏi Đã Chọn ({formik.values.questions.length})
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-white/20 text-white border-white/30">
                                            {formik.values.questionLimit === 10000 ? "∞" : formik.values.questionLimit}
                                        </Badge>
                                        <Dialog open={isSelectedQuestionsPopupOpen}
                                                onOpenChange={setIsSelectedQuestionsPopupOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-white hover:bg-white/20 p-2"
                                                    title="Xem chi tiết"
                                                >
                                                    <MdOutlineZoomInMap className="h-5 w-5"/>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-white">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-2 text-xl">
                                                        <ListIcon className="h-6 w-6 text-blue-600"/>
                                                        Câu Hỏi Đã Chọn ({formik.values.questions.length})
                                                    </DialogTitle>
                                                </DialogHeader>
                                                <div className="overflow-y-auto max-h-[60vh] space-y-4 pr-2">
                                                    {formik.values.questions.length === 0 ? (
                                                        <div className="text-center py-12 text-gray-500">
                                                            <Circle className="h-16 w-16 mx-auto mb-4 opacity-30"/>
                                                            <p className="text-lg">Chưa có câu hỏi nào được chọn</p>
                                                            <p className="text-sm">Hãy chọn câu hỏi từ ngân hàng!</p>
                                                        </div>
                                                    ) : (
                                                        formik.values.questions.map((question) => (
                                                            <QuestionCard
                                                                key={question.id}
                                                                question={question}
                                                                index={question.id}
                                                                showRemove={true}
                                                                onRemove={removeQuestion}
                                                                isInPopup={true}
                                                                displayAdded={false}
                                                            />
                                                        ))
                                                    )}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 max-h-96 overflow-y-auto">
                                {formik.values.questions.length === 0 ? (
                                    <div className="text-center py-8 text-gray-300">
                                        <Circle className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                                        <p>Chưa có câu hỏi nào được chọn</p>
                                        <p className="text-sm">Hãy chọn câu hỏi từ ngân hàng bên phải!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {formik.values.questions.slice(0, 3).map((question) => (
                                            <QuestionCard
                                                key={question.id}
                                                question={question}
                                                index={question.id}
                                                showRemove={true}
                                                onRemove={removeQuestion}
                                                displayAdded={true}
                                            />
                                        ))}
                                        {formik.values.questions.length > 3 && (
                                            <div className="text-center py-2">
                                                <Badge variant="outline" className="border-white/30 text-gray-300">
                                                    +{formik.values.questions.length - 3} câu hỏi khác
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="text-center">
                            <Button
                                type={"submit"}
                                onClick={formik.handleSubmit}
                                className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:from-yellow-500 hover:via-pink-600 hover:to-purple-700 text-white px-12 py-4 text-xl font-bold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
                            >
                                <Sparkles className="h-6 w-6 mr-2"/>
                                Tạo Bài Kiểm Tra Siêu Đỉnh!
                                <Zap className="h-6 w-6 ml-2"/>
                            </Button>
                        </div>
                    </div>

                    {/* Right Column - Question Bank */}
                    <div className="space-y-6">
                        <Card className="p-0 border-0 shadow-2xl bg-white/10 backdrop-blur-xl border-white/20 gap-0">
                            <CardHeader
                                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white rounded-t-lg">
                                <CardTitle className="flex items-center gap-3 text-xl p-4">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Search className="h-6 w-6"/>
                                    </div>
                                    Ngân Hàng Câu Hỏi
                                    <Badge className="bg-white/20 text-white border-white/30 ml-auto">
                                        {selectedQuestion.length > 0 && `${selectedQuestion.length} đã chọn`}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex flex-col md:flex-row gap-4 w-full">
                                    {/* Filters - Compact Layout */}
                                    <div className="space-y-2 w-full md:w-auto flex-shrink-0">
                                        <Label className="text-white font-medium text-sm flex items-center gap-2">
                                            <Globe className="h-4 w-4"/>
                                            Nguồn câu hỏi
                                        </Label>
                                        <Select value={questionSource} onValueChange={setQuestionSource}>
                                            <SelectTrigger
                                                className="border-2 border-white/30 bg-white/10 text-white focus:border-cyan-400 h-9">
                                                <SelectValue placeholder="Chọn nguồn câu hỏi"/>
                                            </SelectTrigger>
                                            <SelectContent className={"bg-purple-800 text-white"}>
                                                <SelectItem value={`${userId}`}>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4"/>
                                                        Câu hỏi của tôi
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="-1">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4"/>
                                                        Câu hỏi của người khác
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Search - Compact */}
                                    <div className="space-y-2 w-full">
                                        <Label className="text-white font-medium text-sm">
                                            <Search className="h-4 w-4"/>
                                            Tìm kiếm
                                        </Label>
                                        <div className="relative">
                                            <Search
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                                            <Input
                                                placeholder="Tìm kiếm câu hỏi..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 border-2 border-white/30 bg-white/10 text-white placeholder:text-gray-300 focus:border-cyan-400 focus:bg-white/20 h-9"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Add Selected Button */}
                                {selectedQuestion.length > 0 && (
                                    <Button
                                        onClick={addSelectedQuestions}
                                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium h-9"
                                    >
                                        <Plus className="h-4 w-4 mr-2"/>
                                        Thêm {selectedQuestion.length} câu hỏi đã chọn
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Questions List */}
                        <Card className="p-0 border-0 shadow-2xl bg-white/10 backdrop-blur-xl border-white/20 gap-0">
                            <CardHeader
                                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-t-lg py-3">
                                <CardTitle className="flex items-center justify-between text-lg p-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <ListIcon className="h-6 w-6"/>
                                        </div>
                                        Danh Sách Câu Hỏi ({filteredQuestions.length})
                                    </div>
                                    <Dialog open={isQuestionBankPopupOpen} onOpenChange={setIsQuestionBankPopupOpen}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-white hover:bg-white/20 p-2"
                                                title="Xem chi tiết"
                                            >
                                                <MdOutlineZoomInMap className="h-5 w-5"/>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-white">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2 text-xl">
                                                    <ListIcon className="h-6 w-6 text-purple-600"/>
                                                    Ngân Hàng Câu Hỏi ({filteredQuestions.length})
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="overflow-y-auto max-h-[60vh] space-y-4 pr-2">
                                                {filteredQuestions.length === 0 ? (
                                                    <div className="text-center py-12 text-gray-500">
                                                        <Search className="h-16 w-16 mx-auto mb-4 opacity-30"/>
                                                        <p className="text-lg">Không tìm thấy câu hỏi nào</p>
                                                    </div>
                                                ) : (
                                                    filteredQuestions.map((question) => (
                                                        <QuestionCard
                                                            key={question.id}
                                                            question={question}
                                                            onToggleSelect={toggleQuestionSelection}
                                                            isInPopup={true}
                                                            displayAdded={false}
                                                        />
                                                    ))
                                                )}
                                            </div>
                                            {selectedQuestion.length > 0 && (
                                                <div className="border-t pt-4">
                                                    <Button
                                                        onClick={() => {
                                                            addSelectedQuestions()
                                                            setIsQuestionBankPopupOpen(false)
                                                        }}
                                                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium"
                                                    >
                                                        <Plus className="h-4 w-4 mr-2"/>
                                                        Thêm {selectedQuestion.length} câu hỏi đã chọn
                                                    </Button>
                                                </div>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="max-h-96 overflow-y-auto space-y-3">
                                    {filteredQuestions.length === 0 ? (
                                        <div className="text-center py-8 text-gray-300">
                                            <Search className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                                            <p>Không tìm thấy câu hỏi nào</p>
                                        </div>
                                    ) : (
                                        filteredQuestions
                                            .slice(0, filteredQuestions.length < 4 ? filteredQuestions.length : 4)
                                            .map((question) => (
                                                <QuestionCard key={question.id} question={question}
                                                              onToggleSelect={toggleQuestionSelection}
                                                              displayAdded={false}/>
                                            ))
                                    )}
                                    {filteredQuestions.length > 4 && (
                                        <div className="text-center py-2">
                                            <Badge variant="outline" className="border-white/30 text-gray-300">
                                                +{filteredQuestions.length - 4} câu hỏi khác
                                            </Badge>
                                        </div>
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
