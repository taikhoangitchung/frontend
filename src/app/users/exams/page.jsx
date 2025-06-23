"use client";

import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import {
    Search,
    Plus,
    Edit,
    BookOpen,
    Target,
    Clock,
    CheckCircle,
    HelpCircle,
    Flame,
    FileText,
    BarChart2
} from "lucide-react";

import { useRouter } from "next/navigation";
import ExamService from "../../../services/ExamService";
import { toast } from "sonner";
import DeleteButton from "../../../components/alerts-confirms/DeleleButton";

export default function ExamManager() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const examPerPage = 10;
    const [totalExams, setTotalExams] = useState(0);

    useEffect(() => {
        fetchExams();
    }, [searchTerm, page]);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const res = await ExamService.getAllMine();
            const filtered = searchTerm.trim()
                ? res.data.filter((e) =>
                    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    e.category.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                : res.data;

            setTotalExams(filtered.length);
            setTotalPage(Math.ceil(filtered.length / examPerPage));
            const start = (page - 1) * examPerPage;
            setExams(filtered.slice(start, start + examPerPage));
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi tải danh sách bài thi");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExam = (id) => {
        toast.info("Chức năng đang được phát triển...");
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-6xl mx-auto px-6 space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-2">
                    <h1 className="text-2xl font-semibold text-gray-900">Tìm kiếm bài thi</h1>
                    <Button
                        onClick={() => router.push("/users/dashboard")}
                        className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-gray-700 text-white hover:bg-gray-600 border border-gray-500 h-9 px-4 py-2"
                    >
                        Quay lại
                    </Button>
                </div>

                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Nhập tiêu đề hoặc danh mục..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="pl-10"
                    />
                </div>

                <Separator />

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">Danh sách bài thi (Tổng: {totalExams})</span>
                        <Button
                            onClick={() => router.push("/exams/create")}
                            className="bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300"
                            variant="outline"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo mới
                        </Button>
                    </div>

                    {exams.map((exam) => (
                        <Card
                            key={exam.id}
                            className="border border-gray-200 hover:shadow-md transition"
                        >
                            <CardHeader className="pb-0">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-xl sm:text-2xl font-bold text-purple-800">{exam.title}</h2>
                                    {exam.playedTimes === 0 && (
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="p-1"
                                                onClick={() => router.push(`/exams/${exam.id}/edit`)}
                                            >
                                                <Edit className="w-6 h-6" />
                                            </Button>
                                            <DeleteButton id={exam.id} handleDelete={handleDeleteExam} />
                                        </div>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 mt-2 text-sm text-gray-700">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                    <p className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {exam.category.name}</p>
                                    <p className="flex items-center gap-1"><Target className="w-4 h-4" /> {exam.difficulty.name}</p>
                                    <p className="flex items-center gap-1"><Clock className="w-4 h-4" /> {exam.duration} phút</p>
                                    <p className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {exam.passScore}</p>
                                    <p className="flex items-center gap-1"><HelpCircle className="w-4 h-4" /> {exam.questions.length}</p>
                                    <p className="flex items-center gap-1"><Flame className="w-4 h-4" /> {exam.playedTimes}</p>
                                </div>

                                <div className="flex gap-3 flex-wrap">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-purple-700 border-purple-300 hover:bg-purple-50 transition-all"
                                        onClick={() => router.push(`/exams/${exam.id}`)}
                                    >
                                        <FileText className="w-4 h-4 mr-1" />
                                        Xem chi tiết
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-purple-700 border-purple-300 hover:bg-purple-50 transition-all"
                                        onClick={() => router.push(`/users/exams/${exam.id}/history`)}
                                    >
                                        <BarChart2 className="w-4 h-4 mr-1" />
                                        Lịch sử
                                    </Button>

                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-center items-center py-4 px-4 gap-2 border-t border-gray-100">
                    {page > 1 && (
                        <Button variant="outline" onClick={() => setPage(page - 1)} className="text-sm">
                            Trang trước
                        </Button>
                    )}
                    <Button className="text-blue-700" disabled>
                        {page}/{totalPage}
                    </Button>
                    {page < totalPage && (
                        <Button variant="outline" onClick={() => setPage(page + 1)} className="text-sm">
                            Trang sau
                        </Button>
                    )}
                </div>

                {!loading && exams.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <Search className="w-12 h-12 mb-4 opacity-50" />
                        <p>Không tìm thấy bài thi nào phù hợp</p>
                    </div>
                )}
                {loading && (
                    <div className="flex justify-center py-8 text-gray-500">Đang tải bài thi...</div>
                )}
            </div>
        </div>
    );
}
