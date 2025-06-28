"use client";

import React, {useEffect, useState} from "react";
import {Button} from "../../../components/ui/button";
import {Input} from "../../../components/ui/input";
import {Card, CardContent, CardHeader} from "../../../components/ui/card";
import {Separator} from "../../../components/ui/separator";
import {
    Search, Plus, Edit, BookOpen, Target, Clock, CheckCircle, HelpCircle, Flame,
    FileText, BarChart2, FlaskConical, ArrowLeft
} from "lucide-react";
import {useRouter, useSearchParams} from "next/navigation";
import ExamService from "../../../services/ExamService";
import {toast} from "sonner";
import DeleteButton from "../../../components/alerts-confirms/DeleleButton";
import RoomService from "../../../services/RoomService";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "../../../components/ui/select";
import CategoryService from "../../../services/CategoryService";

export default function ExamManager() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryIdParam = searchParams.get("categoryId");
    const [categoryId, setCategoryId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [ownerFilter, setOwnerFilter] = useState("all");
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [totalExams, setTotalExams] = useState(0);
    const examPerPage = 10;

    const currentUserId = parseInt(localStorage.getItem("id"));

    useEffect(() => {
        setCategoryId(categoryIdParam);
    }, [categoryIdParam]);

    useEffect(() => {
        fetchExams();
    }, [searchTerm, categoryId, ownerFilter, page]);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await CategoryService.getAll();
                setCategories(res.data);
            } catch (err) {
                console.error("Lỗi tải danh mục:", err);
            }
        }

        fetchCategories();
    }, []);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const res = await ExamService.getAll();
            let filtered = res.data;
            filtered = filtered.filter((e) => e.public || e.author.id === currentUserId);
            if (categoryId) {
                filtered = filtered.filter((e) => String(e.category.id) === categoryId);
            }
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                filtered = filtered.filter((e) =>
                    e.title.toLowerCase().includes(term) ||
                    e.category.name.toLowerCase().includes(term)
                );
            }
            if (ownerFilter === "mine") {
                filtered = filtered.filter((e) => e.author.id === currentUserId);
            } else if (ownerFilter === "others") {
                filtered = filtered.filter((e) => e.author.id !== currentUserId);
            }
            setTotalExams(filtered.length);
            setTotalPage(Math.ceil(filtered.length / examPerPage));
            const start = (page - 1) * examPerPage;
            setExams(filtered.slice(start, start + examPerPage));
        } catch (err) {
            console.error(err);
            toast.error("Đã xảy ra lỗi khi tải danh sách bài thi!");
        } finally {
            setLoading(false);
        }
    };

    async function handleCreateRoom(id) {
        try {
            const response = await RoomService.create(id);
            router.push(`/users/exams/online/${response.data}`);
        } catch (error) {
            console.error(error);
            toast.error("Đã xảy ra lỗi khi tạo phòng thi!");
        }
    }

    const handleDeleteExam = async (id) => {
        try {
            const result = await ExamService.delete(id);
            toast.success(result.data || "Đã xoá bài thi");

            if (page !== 1) setPage(1);
            else fetchExams();
        } catch (error) {
            toast.error(error.response?.data || "Xoá bài thi thất bại");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-6xl mx-auto px-6 space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <h1 className="text-2xl font-semibold text-gray-900">Tìm kiếm bài thi</h1>

                        <Select
                            value={ownerFilter}
                            onValueChange={(value) => {
                                setOwnerFilter(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger
                                className="min-w-36 h-9 border border-gray-300 rounded-md bg-white text-sm cursor-pointer transition-all duration-200">
                                <SelectValue placeholder="Lọc theo tác giả"/>
                            </SelectTrigger>
                            <SelectContent
                                className="z-50 min-w-36 bg-white border border-gray-200 rounded-md shadow-md">
                                <SelectItem value="all">Tất cả tác giả</SelectItem>
                                <SelectItem value="mine">Của tôi</SelectItem>
                                <SelectItem value="others">Của người khác</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={categoryId || "all"}
                            onValueChange={(value) => {
                                const newParams = new URLSearchParams(window.location.search);
                                if (value === "all") {
                                    newParams.delete("categoryId");
                                } else {
                                    newParams.set("categoryId", value);
                                }
                                window.history.replaceState(null, "", `?${newParams.toString()}`);
                                setCategoryId(value === "all" ? null : value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="min-w-36 h-9 border border-gray-300 rounded-md bg-white text-sm">
                                <SelectValue placeholder="Lọc theo danh mục"/>
                            </SelectTrigger>
                            <SelectContent
                                className="z-50 min-w-36 bg-white border border-gray-200 rounded-md shadow-md">
                                <SelectItem value="all">Tất cả danh mục</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                    </div>

                    <button
                        onClick={() => router.push("/users/dashboard")}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs bg-gray-700 text-white hover:bg-gray-600 border border-gray-500 cursor-pointer h-9 px-4 py-2"
                    >
                        <ArrowLeft className="w-4 h-4"/>
                        <span className="text-white">Quay lại</span>
                    </button>
                </div>

                <div className="relative w-full mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 w-4 h-4"/>
                    <Input
                        placeholder="Nhập tiêu đề hoặc danh mục..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="pl-10 bg-white cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-200 border border-gray-500"
                    />
                </div>

                <Separator/>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">Danh sách bài thi (Tổng: {totalExams})</span>
                        <Button
                            onClick={() => router.push("/users/exams/create")}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs h-9 px-4 py-2 has-[>svg]:px-3 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                            variant="outline"
                        >
                            <Plus className="w-4 h-4 mr-2"/>
                            Tạo mới
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div
                                className="w-8 h-8 border-4 border-t-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
                            <span className="ml-3 text-gray-500">Đang tải bài thi...</span>
                        </div>
                    ) : exams.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Search className="w-12 h-12 mb-4 opacity-50"/>
                            <p>Không tìm thấy bài thi nào phù hợp</p>
                        </div>
                    ) : (
                        exams.map((exam) => (
                            <Card key={exam.id}
                                  className="border border-gray-200 hover:shadow-md transition-all duration-200 bg-white">
                                <CardHeader className="pb-0">
                                    <div className="flex justify-between items-start">
                                        <h2 className="text-xl sm:text-2xl font-bold text-purple-800">{exam.title}</h2>
                                        {exam.author.id === currentUserId && exam.playedTimes === 0 && (
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="p-1 cursor-pointer transition-all duration-200"
                                                    onClick={() => router.push(`/users/exams/${exam.id}/edit`)}
                                                >
                                                    <Edit className="w-6 h-6"/>
                                                </Button>
                                                <DeleteButton id={exam.id} handleDelete={handleDeleteExam}/>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4 mt-2 text-sm text-gray-700">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                        <p className="flex items-center gap-1">
                                            <BookOpen className="w-4 h-4"/>
                                            Danh mục: <strong>{exam.category.name}</strong>
                                        </p>
                                        <p className="flex items-center gap-1">
                                            <Target className="w-4 h-4"/>
                                            Độ khó: <strong>{exam.difficulty.name}</strong>
                                        </p>
                                        <p className="flex items-center gap-1">
                                            <Clock className="w-4 h-4"/>
                                            Thời gian: <strong>{exam.duration} phút</strong>
                                        </p>
                                        <p className="flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4"/>
                                            Điểm đạt: <strong>{exam.passScore}</strong>
                                        </p>
                                        <p className="flex items-center gap-1">
                                            <HelpCircle className="w-4 h-4"/>
                                            Số câu hỏi: <strong>{exam.questions.length}</strong>
                                        </p>
                                        <p className="flex items-center gap-1">
                                            <Flame className="w-4 h-4"/>
                                            Lượt chơi: <strong>{exam.playedTimes}</strong>
                                        </p>
                                    </div>

                                    <div className="flex gap-3 flex-wrap">
                                        {ownerFilter === "mine" && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-purple-700 border-purple-300 hover:bg-purple-50 cursor-pointer transition-all duration-200"
                                                onClick={() => router.push(`/users/exams/${exam.id}`)}
                                            >
                                                <FileText className="w-4 h-4 mr-1"/>
                                                Xem danh sách câu hỏi
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-blue-500 border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                                            onClick={() => router.push(`/users/exams/${exam.id}/history`)}
                                        >
                                            <BarChart2 className="w-4 h-4 mr-1"/>
                                            Lịch sử thi
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-green-600 border-green-300 hover:bg-green-50 cursor-pointer transition-all duration-200"
                                            onClick={() => handleCreateRoom(exam.id)}
                                        >
                                            <FlaskConical className="w-4 h-4 mr-1"/>
                                            Tạo phòng thi online
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                <div className="flex justify-center items-center py-4 px-4 gap-2 border-t border-gray-100">
                    {page > 1 && (
                        <Button
                            variant="outline"
                            onClick={() => setPage(page - 1)}
                            className="text-sm cursor-pointer transition-all duration-200"
                        >
                            Trang trước
                        </Button>
                    )}
                    <Button
                        className="text-blue-700 cursor-pointer transition-all duration-200"
                        disabled
                    >
                        {page}/{totalPage}
                    </Button>
                    {page < totalPage && (
                        <Button
                            variant="outline"
                            onClick={() => setPage(page + 1)}
                            className="text-sm cursor-pointer transition-all duration-200"
                        >
                            Trang sau
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
