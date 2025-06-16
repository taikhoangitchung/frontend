"use client"

import {useState, useEffect} from "react"
import {Button} from "../../../components/ui/button"
import {Input} from "../../../components/ui/input"
import {Card, CardContent, CardHeader} from "../../../components/ui/card"
import {Separator} from "../../../components/ui/separator"
import {Search, Plus, Edit, Trash2, X, Check, Grid3X3} from "lucide-react"
import {useRouter} from "next/navigation";

export default function QuizInterface() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState({
        questionType: "multiple-choice",
    })

    const fetchQuestions = async (searchQuery = "") => {
        setLoading(true)
        try {
            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            // Mock data - replace with actual API call
            const mockQuestions = [
                {
                    id: 1,
                    question: "eqwewewe",
                    type: "multiple-choice",
                    answers: [
                        {id: 1, text: "qq", isCorrect: false},
                        {id: 2, text: "qweqe", isCorrect: false},
                        {id: 3, text: "qwqe", isCorrect: true},
                    ],
                },
            ]

            // Filter based on search term
            const filteredQuestions = searchQuery
                ? mockQuestions.filter((q) => q.question.toLowerCase().includes(searchQuery.toLowerCase()))
                : mockQuestions

            setQuestions(filteredQuestions)
        } catch (error) {
            console.error("Error fetching questions:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchQuestions(searchTerm)
    }, [searchTerm])

    const handleAddQuestion = () => {
        console.log("Add question clicked")
    }

    function handleDelete(id) {
        console.log("Delete question clicked")
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Tìm kiếm câu hỏi từ Thư viện Quizizz
                </h1>

                {/* Search Input with Icon */}
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
                    <Input
                        placeholder="Nhập tên chủ đề của câu hỏi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <Separator/>

            {/* Questions Section */}
            <div className="space-y-4">
                {/* Questions Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-medium">{questions.length} câu hỏi</span>
                    </div>
                    <Button
                        onClick={handleAddQuestion}
                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300"
                        variant="outline"
                    >
                        <Plus className="w-4 h-4 mr-2"/>
                        Thêm câu hỏi
                    </Button>
                </div>

                {/* Question Cards */}
                {questions.map((question, index) => (
                    <Card key={question.id} className="border border-gray-200">
                        <CardHeader className="pb-3">
                            {/* Question Controls */}
                            <div className="flex items-center gap-4 text-sm">
                                <Button variant="ghost" size="sm" className="p-1">
                                    <Grid3X3 className="w-4 h-4"/>
                                </Button>

                                <div className="flex items-center gap-1">
                                    <Check className="w-4 h-4 text-green-600"/>
                                    <span className="font-medium">{index + 1}. Nhiều lựa chọn</span>
                                </div>

                                <div className="flex items-center gap-1 ml-auto">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-1"
                                        onClick={() => router.push(`/questions/${question.id}/edit`)}
                                    >
                                        <Edit className="w-4 h-4"/>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-1"
                                        onClick={() => handleDelete(question.id)}
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Question Text */}
                            <div className="text-lg font-medium">{question.question}</div>

                            {/* Answer Choices */}
                            <div className="space-y-3">
                                <div className="text-sm font-medium text-gray-600">Lựa chọn trả lời</div>

                                <div className="grid grid-cols-2 gap-3">
                                    {question.answers.map((answer) => (
                                        <div
                                            key={answer.id}
                                            className={`flex items-center gap-2 p-3 rounded-lg border ${
                                                answer.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                                            }`}
                                        >
                                            {answer.isCorrect ? (
                                                <Check className="w-4 h-4 text-green-600"/>
                                            ) : (
                                                <X className="w-4 h-4 text-red-600"/>
                                            )}
                                            <span className="text-sm">{answer.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center py-8">
                    <div className="text-gray-500">Đang tải câu hỏi...</div>
                </div>
            )}

            {/* Empty State */}
            {!loading && questions.length === 0 && searchTerm && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Search className="w-12 h-12 mb-4 opacity-50"/>
                    <p>Không tìm thấy câu hỏi nào với từ khóa "{searchTerm}"</p>
                </div>
            )}
        </div>
    )
}
