"use client"

import {useEffect, useState} from "react"
import {Button} from "../../../components/ui/button"
import {Input} from "../../../components/ui/input"
import {Card, CardContent, CardHeader} from "../../../components/ui/card"
import {Separator} from "../../../components/ui/separator"
import {Search, Plus, Edit} from "lucide-react"
import {useRouter} from "next/navigation"
import ExamService from "../../../services/ExamService"
import {toast} from "sonner"
import DeleteButton from "../../../components/alerts-confirms/DeleleButton";

export default function ExamManager() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [exams, setExams] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPage, setTotalPage] = useState(1)
    const examPerPage = 10
    const [totalExams, setTotalExams] = useState(0)

    useEffect(() => {
        fetchExams()
    }, [searchTerm, page])

    const fetchExams = async () => {
        setLoading(true)
        try {
            const res = await ExamService.getAllMine()
            const filtered = searchTerm.trim() !== ""
                ? res.data.filter((e) =>
                    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    e.category.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                : res.data

            setTotalExams(filtered.length)
            setTotalPage(Math.ceil(filtered.length / examPerPage))
            const start = (page - 1) * examPerPage
            setExams(filtered.slice(start, start + examPerPage))
        } catch (err) {
            console.error(err)
            toast.error("Lỗi khi tải danh sách bài thi")
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteExam = (id) => {
        toast.info("Chức năng đang được phát triển...")
    }

    const handleNextPage = () => setPage(page + 1)
    const handlePrePage = () => setPage(page - 1)

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">Tìm kiếm bài thi của tôi</h1>
                    <Button
                        onClick={() => router.push("/users/dashboard")}
                        variant="outline"
                        className="bg-gray-100 text-gray-800 hover:bg-gray-200 border"
                    >
                        Quay về trang chính
                    </Button>
                </div>

                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
                    <Input
                        placeholder="Nhập tiêu đề hoặc danh mục..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <Separator/>

            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className="text-lg font-medium flex-1">
                        Danh sách bài thi (Tổng: {totalExams})
                    </span>
                    <Button
                        onClick={() => router.push("/exams/create")}
                        variant="outline"
                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300"
                    >
                        <Plus className="w-4 h-4 mr-2"/>
                        Tạo mới
                    </Button>
                </div>

                <div className="flex flex-col gap-4">
                    {exams.map((exam) => (
                        <Card
                            key={exam.id}
                            className="w-full p-5 rounded-2xl border border-purple-200 hover:shadow-lg transition group"
                        >
                            <div className="flex flex-col h-full justify-between gap-4">
                                <CardHeader className="pb-3 relative">
                                    <div className="text-xl font-bold text-purple-800">{exam.title}</div>

                                    <div className="absolute top-4 right-4 flex gap-2">
                                        {exam.playedTimes === 0 && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 border-gray-300 text-gray-600 hover:bg-gray-100"
                                                    onClick={() => router.push(`/exams/${exam.id}/edit`)}
                                                >
                                                    <Edit className="w-4 h-4"/>
                                                </Button>

                                                <DeleteButton id={exam.id} handleDelete={handleDeleteExam}/>
                                            </>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div
                                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-sm text-gray-600 mt-2">
                                        <p><span className="font-medium">📚 Danh mục:</span> {exam.category.name}</p>
                                        <p><span className="font-medium">🎯 Độ khó:</span> {exam.difficulty.name}</p>
                                        <p><span className="font-medium">⏱️ Thời gian:</span> {exam.duration} phút</p>
                                        <p><span className="font-medium">✅ Điểm đạt:</span> {exam.passScore}</p>
                                        <p><span className="font-medium">❓ Câu hỏi:</span> {exam.questions.length}</p>
                                        <p><span className="font-medium">🔥 Lượt chơi:</span> {exam.playedTimes}</p>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-4 text-purple-700 border-purple-300 hover:bg-purple-50"
                                        onClick={() => router.push(`/exams/${exam.id}`)}
                                    >
                                        Xem chi tiết câu hỏi
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-4 text-purple-700 border-purple-300 hover:bg-purple-50"
                                        onClick={() => router.push(`/users/exams/${exam.id}/history`)}
                                    >
                                        📊 Lịch sử
                                    </Button>
                                </CardContent>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center py-4 px-4 gap-2 border-t border-gray-100">
                {page > 1 && (
                    <Button
                        variant="outline"
                        onClick={handlePrePage}
                        className="border-purple-200 hover:bg-purple-100 hover:text-purple-700 text-sm"
                    >
                        Trang trước
                    </Button>
                )}
                <Button className="text-blue-700" disabled>{page}/{totalPage}</Button>
                {page < totalPage && (
                    <Button
                        variant="outline"
                        onClick={handleNextPage}
                        className="border-purple-200 hover:bg-purple-100 hover:text-purple-700 text-sm"
                    >
                        Trang sau
                    </Button>
                )}
            </div>

            {!loading && exams.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Search className="w-12 h-12 mb-4 opacity-50"/>
                    <p>Không tìm thấy bài thi nào phù hợp</p>
                </div>
            )}
        </div>
    )
}
