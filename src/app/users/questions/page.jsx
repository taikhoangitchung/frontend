"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { Search, Plus, Edit, X, Check, ArrowLeft, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import QuestionService from "../../../services/QuestionService";
import CategoryService from "../../../services/CategoryService";
import DeleteButton from "../../../components/alerts-confirms/DeleleButton";
import { Badge } from "../../../components/ui/badge";

const Modal = ({ onClose, children }) => {
    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <Button
                    variant="ghost"
                    className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white text-1xl font-semibold z-10 transition-all duration-200 cursor-pointer rounded-full w-9 h-9 flex items-center justify-center"
                    onClick={onClose}
                >
                    ✕
                </Button>
                {children}
            </div>
        </div>
    );
};

export default function QuestionTable() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [categories, setCategories] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [ownerFilter, setOwnerFilter] = useState("all");
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1); // Thay totalPage bằng totalPages
    const [userId, setUserId] = useState(undefined);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [expandedIds, setExpandedIds] = useState([]);
    const questionPerPage = 20; // Cập nhật theo yêu cầu 20 câu hỏi/trang

    const imageBaseUrl = "https://quizgymapp.onrender.com";

    useEffect(() => {
        const id = parseInt(localStorage.getItem("id") || "0");
        setUserId(id);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await CategoryService.getAll();
                setCategories(res.data);
            } catch (err) {
                toast.error("Không thể tải danh mục");
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const id = searchParams.get("categoryId") || "all";
        setCategoryFilter(id);
    }, [searchParams]);

    const fetchQuestions = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            let res;
            if (categoryFilter === "all" && ownerFilter === "all" && !debouncedSearchTerm) {
                res = await QuestionService.getAll(page - 1, questionPerPage); // page bắt đầu từ 0
            } else {
                const sourceId = ownerFilter === "mine" ? userId : ownerFilter === "others" ? -1 : -999;
                res = await QuestionService.filterByCategoryAndSource(
                    categoryFilter === "all" ? -1 : parseInt(categoryFilter),
                    sourceId,
                    userId,
                    debouncedSearchTerm,
                    page - 1,
                    questionPerPage
                );
            }
            setQuestions(res.data.content); // Lấy content từ Page
            setTotalPages(res.data.totalPages); // Cập nhật tổng số trang
        } catch (error) {
            if (error.response?.status === 403) {
                router.push("/forbidden");
            } else if (error.response?.status === 401) {
                toast.error("Token hết hạn hoặc không hợp lệ.");
                setTimeout(() => router.push("/login"), 2000);
            } else {
                toast.error("Đã xảy ra lỗi khi tải câu hỏi!");
            }
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm, ownerFilter, categoryFilter, page, userId]);

    useEffect(() => {
        if (userId !== undefined) {
            fetchQuestions();
        }
    }, [fetchQuestions, userId, debouncedSearchTerm]);

    const handleCategoryChange = (value) => {
        const params = new URLSearchParams(window.location.search);
        if (value === "all") {
            params.delete("categoryId");
        } else {
            params.set("categoryId", value);
        }
        router.replace(`?${params.toString()}`);
        setPage(1);
    };

    const toggleExpand = (id) => {
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleEdit = async (id) => {
        try {
            await QuestionService.checkEditable(id);
            router.push(`/users/questions/${id}/edit`);
        } catch (error) {
            toast.error(error.response?.data || "Không thể chỉnh sửa");
            console.log(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await QuestionService.delete(id);
            toast.success(res.data);
            setPage(1);
            await fetchQuestions();
        } catch (err) {
            toast.error(err.response?.data || "Xóa thất bại");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-6xl mx-auto px-6">
                {/* Filters */}
                <div className="flex flex-wrap gap-3 justify-between mb-6 items-center">
                    <div className="flex flex-wrap gap-3 items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Tìm kiếm câu hỏi
                        </h1>
                        <div className="relative z-10">
                            <Select
                                value={ownerFilter}
                                onValueChange={(value) => {
                                    setOwnerFilter(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger
                                    className="min-w-36 h-9 border border-gray-300 rounded-md bg-white text-sm cursor-pointer transition-all duration-200 hover:bg-gray-100"
                                >
                                    <SelectValue placeholder="Tác giả"/>
                                </SelectTrigger>
                                <SelectContent
                                    position="popper"
                                    className="z-50 bg-white border border-gray-200 shadow-lg"
                                >
                                    <SelectItem value="all">Tất cả tác giả</SelectItem>
                                    <SelectItem value="mine">Của tôi</SelectItem>
                                    <SelectItem value="others">Của người khác</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative z-10">
                            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                                <SelectTrigger
                                    className="min-w-36 h-9 border border-gray-300 rounded-md bg-white text-sm cursor-pointer transition-all duration-200 hover:bg-gray-100"
                                >
                                    <SelectValue placeholder="Danh mục"/>
                                </SelectTrigger>
                                <SelectContent
                                    position="popper"
                                    className="z-50 bg-white border border-gray-200 shadow-lg"
                                >
                                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push("/users/dashboard")}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs bg-gray-700 text-white hover:bg-gray-600 border border-gray-500 cursor-pointer h-9 px-4 py-2"
                    >
                        <ArrowLeft className="w-4 h-4"/>
                        <span className="text-white">Quay lại</span>
                    </button>
                </div>

                {/* Search box */}
                <div className="relative w-full mb-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 w-4 h-4"/>
                    <Input
                        placeholder="Nhập nội dung câu hỏi, người tạo hoặc đáp án..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="pl-10 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-200 border border-gray-500"
                    />
                </div>

                <Separator/>

                {/* List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">
                            Danh sách câu hỏi (Tổng: {questions.length})
                        </span>
                        <Button
                            onClick={() => router.push("/users/questions/create")}
                            className="bg-purple-600 hover:bg-purple-700 cursor-pointer text-white"
                        >
                            <Plus className="w-4 h-4 mr-2"/>
                            Tạo mới
                        </Button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Array.from({ length: questionPerPage }).map((_, i) => (
                                <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
                            ))}
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
                    ) : (
                        questions.map((q, idx) => (
                            <Card
                                key={q.id}
                                className="bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer hover:ring-1 hover:scale-[1.01] hover:ring-teal-300 pt-3 pb-3 gap-0 mb-2"
                                onClick={() => toggleExpand(q.id)}
                            >
                                <CardHeader className="gap-0 !pb-0 px-6">
                                    <div className="flex justify-between items-start gap-2">
                                        <h2 className="text-lg font-semibold text-purple-800 flex-1 whitespace-pre-wrap">
                                            {idx + 1 + (page - 1) * questionPerPage}. {q.content}
                                        </h2>
                                        {q.user.id === userId && (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(q.id);
                                                    }}
                                                    className="cursor-pointer text-gray-500 hover:text-teal-700 hover:bg-black/10 px-2 py-1 transition-all duration-200"
                                                >
                                                    <Edit className="w-5 h-5"/>
                                                </Button>
                                                <DeleteButton
                                                    id={q.id}
                                                    handleDelete={handleDelete}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="cursor-pointer text-gray-500 hover:bg-red-200 hover:text-red-700 px-2 py-1 transition-all duration-200"
                                                />
                                            </div>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleExpand(q.id);
                                            }}
                                            className="cursor-pointer text-gray-500 hover:text-teal-700 hover:bg-black/10 px-2 py-1 transition-all duration-200"
                                            title="Xem đáp án"
                                        >
                                            <ChevronDown
                                                className={`h-4 w-4 transform transition-transform duration-200 ${
                                                    expandedIds.includes(q.id) ? "rotate-180" : ""
                                                }`}
                                            />
                                        </Button>
                                    </div>
                                </CardHeader>
                                {expandedIds.includes(q.id) && (
                                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {q.image && (
                                            <div className="col-span-full">
                                                <img
                                                    src={`${imageBaseUrl}${q.image}`}
                                                    className="max-w-[50%] mt-2 cursor-pointer hover:scale-105 transition-transform"
                                                    onClick={() => {
                                                        setSelectedImage(`${imageBaseUrl}${q.image}`);
                                                        setModalOpen(true);
                                                    }}
                                                    alt="image"
                                                />
                                            </div>
                                        )}
                                        {q.answers.map((a) => (
                                            <div
                                                key={a.id}
                                                className={`flex items-center gap-2 p-3 rounded-lg border ${
                                                    a.correct
                                                        ? "bg-green-50 border-green-200"
                                                        : "bg-red-50 bg-opacity-20 border-red-200"
                                                }`}
                                            >
                                                {a.correct ? (
                                                    <Check className="w-4 h-4 text-green-600"/>
                                                ) : (
                                                    <X className="w-4 h-4 text-red-400 opacity-50"/>
                                                )}
                                                <span className="text-sm whitespace-pre-wrap">{a.content}</span>
                                            </div>
                                        ))}
                                        <div className="col-span-full flex flex-wrap gap-2 mt-1">
                                            <Badge
                                                variant="outline"
                                                className="text-xs border-teal-300 text-teal-700 bg-teal-50"
                                            >
                                                {q.category.name}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="text-xs border-purple-300 text-purple-700 bg-purple-50"
                                            >
                                                {q.difficulty.name}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="text-xs border-gray-300 text-gray-600"
                                            >
                                                {q.user.id === userId ? "tôi" : q.user.username}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))
                    )}
                </div>

                {/* Pagination */}
                <div className="flex justify-center gap-3 mt-6">
                    {page > 1 && (
                        <Button variant="outline" onClick={() => setPage(page - 1)} className="transition-all duration-200 cursor-pointer hover:bg-purple-100">
                            Trang trước
                        </Button>
                    )}
                    <Button disabled>
                        {page}/{totalPages}
                    </Button>
                    {page < totalPages && (
                        <Button variant="outline" onClick={() => setPage(page + 1)} className="transition-all duration-200 cursor-pointer hover:bg-purple-100">
                            Trang sau
                        </Button>
                    )}
                </div>
            </div>

            {/* Image modal */}
            {modalOpen && (
                <Modal onClose={() => setModalOpen(false)}>
                    <img
                        src={selectedImage}
                        alt="Question"
                        className="w-full h-full max-h-[90vh] object-contain"
                    />
                </Modal>
            )}
        </div>
    );
}