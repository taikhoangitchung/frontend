"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { Search, Plus, Edit, BookOpen, Target, Clock, CheckCircle, HelpCircle, Flame, FileText, BarChart2, FlaskConical, ArrowLeft, Play } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ExamService from "../../../services/ExamService";
import { toast } from "sonner";
import DeleteButton from "../../../components/alerts-confirms/DeleleButton";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../components/ui/select";
import CategoryService from "../../../services/CategoryService";

// Giả định RoomService nếu chưa được import
const RoomService = {
    create: async (id) => {
        console.warn("RoomService.create not implemented, returning mock response");
        return { data: "mock-room-id" }; // Mock response để tránh lỗi
    },
};

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
    const [totalPages, setTotalPages] = useState(1);
    const [totalExams, setTotalExams] = useState(0);
    const examPerPage = 10;
    const currentUserId = parseInt(localStorage.getItem("id"));

    useEffect(() => {
        setCategoryId(categoryIdParam);
    }, [categoryIdParam]);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await CategoryService.getAll(0, 10);
                setCategories(res.data.content || []);
            } catch (err) {
                toast.error("Không thể tải danh mục");
            }
        }
        fetchCategories();
    }, []);

    const fetchExams = async () => {
        if (!currentUserId) return;
        setLoading(true);
        try {
            const res = await ExamService.getAll(page - 1, examPerPage, categoryId, searchTerm, ownerFilter, currentUserId);
            const content = res.data.content || [];
            if (!Array.isArray(content)) {
                setExams([]);
            } else {
                setExams(content);
            }
            setTotalPages(res.data.totalPages || 1);
            setTotalExams(res.data.totalElements || 0);
        } catch (err) {
            if (err.response?.status === 403) {
                router.push("/forbidden");
            } else if (err.response?.status === 401) {
                toast.error("Token hết hạn hoặc không hợp lệ. Đang chuyển hướng...");
                setTimeout(() => router.push("/login"), 2000);
            } else {
                toast.error("Đã xảy ra lỗi khi tải danh sách bài thi!");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, [searchTerm, categoryId, ownerFilter, page, currentUserId]);

    async function handleCreateRoom(id) {
        try {
            if (!RoomService.create) {
                toast.error("Chức năng tạo phòng thi chưa được cài đặt!");
                return;
            }
            const response = await RoomService.create(id);
            router.push(`/users/exams/online/${response.data}`);
        } catch (error) {
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
                            <SelectTrigger className="min-w-36 h-9 border border-gray-300 rounded-md bg-white text-sm cursor-pointer transition-all duration-200 hover:bg-gray-100">
                                <SelectValue placeholder="Lọc theo tác giả" />
                            </SelectTrigger>
                            <SelectContent className="z-50 min-w-36 bg-white border border-gray-200 rounded-md shadow-md">
                                <SelectItem value="all" className="hover:bg-gray-100 cursor-pointer transition-all duration-200">
                                    Tất cả tác giả
                                </SelectItem>
                                <SelectItem value="mine" className="hover:bg-gray-100 cursor-pointer transition-all duration-200">
                                    Của tôi
                                </SelectItem>
                                <SelectItem value="others" className="hover:bg-gray-100 cursor-pointer transition-all duration-200">
                                    Của người khác
                                </SelectItem>
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
                            <SelectTrigger className="min-w-36 h-9 border border-gray-300 rounded-md bg-white text-sm cursor-pointer transition-all duration-200 hover:bg-gray-100">
                                <SelectValue placeholder="Lọc theo danh mục" />
                            </SelectTrigger>
                            <SelectContent className="z-50 min-w-36 bg-white border border-gray-200 rounded-md shadow-md">
                                <SelectItem value="all" className="hover:bg-gray-100 cursor-pointer transition-all duration-200">
                                    Tất cả danh mục
                                </SelectItem>
                                {Array.isArray(categories) && categories.map((cat) => (
                                    <SelectItem
                                        key={cat.id}
                                        value={String(cat.id)}
                                        className="hover:bg-gray-100 cursor-pointer transition-all duration-200"
                                    >
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <button
                        onClick={() => router.push("/users/dashboard")}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs bg-gray-700 text-white hover:bg-gray-600 border border-gray-500 cursor-pointer h-9 px-4 py-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-white">Quay lại</span>
                    </button>
                </div>

                <div className="relative w-full mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 w-4 h-4" />
                    <Input
                        placeholder="Nhập tiêu đề hoặc danh mục..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="pl-10 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-200 border border-gray-500"
                    />
                </div>

                <Separator />

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">Danh sách bài thi (Tổng: {totalExams})</span>
                        <Button
                            onClick={() => router.push("/users/exams/create")}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs h-9 px-4 py-2 has-[>svg]:px-3 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                            variant="outline"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo mới
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="w-8 h-8 border-4 border-t-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
                            <span className="ml-3 text-gray-500">Đang tải bài thi...</span>
                        </div>
                    ) : exams.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Search className="w-12 h-12 mb-4 opacity-50" />
                            <p>Không tìm thấy bài thi nào phù hợp</p>
                        </div>
                    ) : (
                        exams.map((exam) => {
                            if (!exam || typeof exam !== "object") {
                                return null;
                            }
                            const author = exam.author || {};
                            const category = exam.category || {};
                            const difficulty = exam.difficulty || {};
                            return (
                                <Card
                                    key={exam.id}
                                    className="border border-gray-200 hover:shadow-md transition-all duration-200 bg-white"
                                >
                                    <CardHeader className="pb-0">
                                        <div className="flex justify-between items-start">
                                            <h2 className="text-xl sm:text-2xl font-bold text-purple-800">
                                                {exam.title || "Không có tiêu đề"}
                                            </h2>
                                            {author.id === currentUserId && (exam.playedTimes || 0) === 0 && (
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="cursor-pointer text-gray-500 hover:text-teal-700 hover:bg-black/10 px-2 py-1 transition-all duration-200"
                                                        onClick={() => router.push(`/users/exams/${exam.id}/edit`)}
                                                    >
                                                        <Edit className="w-6 h-6" />
                                                    </Button>
                                                    <DeleteButton
                                                        id={exam.id}
                                                        variant="ghost"
                                                        size="sm"
                                                        handleDelete={handleDeleteExam}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 mt-2 text-sm text-gray-700">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                            <p className="flex items-center gap-1">
                                                <BookOpen className="w-4 h-4" /> Danh mục:{" "}
                                                <strong>{category.name || "Không xác định"}</strong>
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <Target className="w-4 h-4" /> Độ khó:{" "}
                                                <strong>{difficulty.name || "Không xác định"}</strong>
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" /> Thời gian:{" "}
                                                <strong>{exam.duration || 0} phút</strong>
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <CheckCircle className="w-4 h-4" /> Điểm đạt:{" "}
                                                <strong>{exam.passScore || 0}</strong>
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <HelpCircle className="w-4 h-4" /> Số câu hỏi:{" "}
                                                <strong>{exam.questionCount || 0}</strong>
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <Flame className="w-4 h-4" /> Lượt chơi:{" "}
                                                <strong>{exam.playedTimes || 0}</strong>
                                            </p>
                                        </div>
                                        <div className="flex gap-3 flex-wrap">
                                            {author.id === currentUserId && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-purple-700 border-purple-300 hover:bg-purple-50 cursor-pointer transition-all duration-200"
                                                    onClick={() => router.push(`/users/exams/${exam.id}`)}
                                                >
                                                    <FileText className="w-4 h-4 mr-1" /> Xem danh sách câu hỏi
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-blue-500 border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                                                onClick={() => router.push(`/users/exams/${exam.id}/history`)}
                                            >
                                                <BarChart2 className="w-4 h-4 mr-1" /> Lịch sử thi
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-green-600 border-green-300 hover:bg-green-50 cursor-pointer transition-all duration-200"
                                                onClick={() => handleCreateRoom(exam.id)}
                                            >
                                                <FlaskConical className="w-4 h-4 mr-1" /> Tạo phòng thi online
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-emerald-600 border-emerald-300 hover:bg-emerald-100 hover:text-emerald-700 cursor-pointer transition-all duration-200"
                                                onClick={() => router.push(`/users/exams/${exam.id}/play`)}
                                            >
                                                <Play className="w-4 h-4 mr-1" /> Thực hành
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>

                <div className="flex justify-center items-center py-4 px-4 gap-2 border-t border-gray-100">
                    {page > 1 && (
                        <Button
                            variant="outline"
                            onClick={() => setPage(page - 1)}
                            className="transition-all duration-200 cursor-pointer hover:bg-purple-100"
                        >
                            Trang trước
                        </Button>
                    )}
                    <Button disabled>{page}/{totalPages}</Button>
                    {page < totalPages && (
                        <Button
                            variant="outline"
                            onClick={() => setPage(page + 1)}
                            className="transition-all duration-200 cursor-pointer hover:bg-purple-100"
                        >
                            Trang sau
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}