"use client"

import {useState, useEffect} from "react"
import {Button} from "../../../../components/ui/button"
import {Input} from "../../../../components/ui/input"
import {Card, CardContent, CardHeader} from "../../../../components/ui/card"
import {Separator} from "../../../../components/ui/separator"
import {Search, Plus, Edit, X, Check, Grid3X3} from "lucide-react"
import {useRouter} from "next/navigation";
import QuestionService from "../../../../services/QuestionService";
import {toast} from "sonner";
import DeleteButton from "../../../../components/DeleleButton";

export default function QuizInterface() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPage, setTotalPage] = useState(1)
    const questionPerPage = 20
    const userId = localStorage.getItem("id")

    const [filters, setFilters] = useState({
        questionType: "multiple-choice",
    })

    useEffect(() => {
        setLoading(true)
        const userId = localStorage.getItem("id")
        try {
            QuestionService.getByUserId(userId)
                .then(res => {
                    const filteredQuestions = searchTerm.trim() !== ""
                        ? res.data.filter((q) => q.content.toLowerCase().includes(searchTerm.toLowerCase()))
                        : res.data;
                    handlePagination(filteredQuestions);
                })
        } catch (error) {
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
    }, [searchTerm, page])

    const handlePagination = (data) => {
        setTotalPage(Math.ceil(data.length / questionPerPage))
        const start = page === 1 ? 0 : (page - 1) * questionPerPage
        const end = start + questionPerPage

        const thisPageItems = data.slice(start, end)
        setQuestions([...thisPageItems])
    }

    const handlePrePage = () => setPage(page - 1);

    const handleNextPage = () => setPage(page + 1);

    const handleAddQuestion = () => {
        router.push("/users/questions/create")
    }

    async function handleDelete(id) {
        try {
            const result = await QuestionService.delete(id);
            toast.success(result.data);

            const response = await QuestionService.getByUserId(userId);
            const filteredQuestions = searchTerm.trim() !== ""
                ? response.data.filter((q) => q.content.toLowerCase().includes(searchTerm.toLowerCase()))
                : response.data;

            const newTotalPages = Math.ceil(filteredQuestions.length / questionPerPage);
            if (page > newTotalPages) {
                setPage(1);
            }

            handlePagination(filteredQuestions);
        } catch (error) {
            toast.error(error.response.data);
            console.error("Xóa thất bại:", error);
        }
    }


    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Tìm kiếm câu hỏi của tôi
                </h1>

                {/* Search Input with Icon */}
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
                    <Input
                        placeholder="Nhập nội dung câu hỏi..."
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
                                    <span className="font-medium">{index + 1}. {question.type}</span>
                                </div>

                                <div className="flex items-center gap-1 ml-auto">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-1"
                                        onClick={() => router.push(`/users/questions/${question.id}/edit`)}
                                    >
                                        <Edit className="w-4 h-4"/>
                                    </Button>
                                    <DeleteButton item={question} handleDelete={handleDelete}/>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Question Text */}
                            <div className="text-lg font-medium">{question.content}</div>

                            {/* Answer Choices */}
                            <div className="space-y-3">
                                <div className="text-sm font-medium text-gray-600">Lựa chọn trả lời</div>

                                <div className="grid grid-cols-2 gap-3">
                                    {question.answers.map((answer) => (
                                        <div
                                            key={answer.id}
                                            className={`flex items-center gap-2 p-3 rounded-lg border ${
                                                answer.correct ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                                            }`}
                                        >
                                            {answer.correct ? (
                                                <Check className="w-4 h-4 text-green-600"/>
                                            ) : (
                                                <X className="w-4 h-4 text-red-600"/>
                                            )}
                                            <span className="text-sm">{answer.content}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center py-4 px-4 gap-2 border-t border-gray-100">
                {page !== 1 && (
                    <Button
                        variant="outline"
                        onClick={handlePrePage}
                        className="border-purple-200 hover:bg-purple-100 hover:text-purple-700 text-sm"
                    >
                        Trang trước
                    </Button>
                )}
                <Button
                    className="text-blue-700"
                    disabled
                >
                    {page}/{totalPage}
                </Button>
                {page !== totalPage && (
                    <Button
                        variant="outline"
                        onClick={handleNextPage}
                        className="border-purple-200 hover:bg-purple-100 hover:text-purple-700 text-sm"
                    >
                        Trang sau
                    </Button>
                )}
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
