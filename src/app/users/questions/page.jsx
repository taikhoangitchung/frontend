"use client";

import React, {useState, useEffect, useCallback} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Button} from "../../../components/ui/button";
import {Input} from "../../../components/ui/input";
import {Card, CardContent, CardHeader} from "../../../components/ui/card";
import {Separator} from "../../../components/ui/separator";
import {Search, Plus, Edit, X, Check, ArrowLeft} from "lucide-react";
import {toast} from "sonner";
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

export default function QuizInterface() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [categories, setCategories] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [ownerFilter, setOwnerFilter] = useState("all");
    const [questions, setQuestions] = useState([]);
    const [allFilteredQuestions, setAllFilteredQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [userId, setUserId] = useState(undefined);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const questionPerPage = 20;

    const imageBaseUrl = "http://localhost:8080";

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

    // Đồng bộ categoryFilter với URL param
    useEffect(() => {
        const id = searchParams.get("categoryId") || "all";
        setCategoryFilter(id);
    }, [searchParams]);

    const fetchQuestions = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await QuestionService.getAll();
            const filtered = res.data.filter((q) => {
                const matchesSearch =
                    q.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                    q.answers.some((a) =>
                        a.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
                    ) ||
                    q.user.username?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
                const matchesOwner =
                    ownerFilter === "all"
                        ? true
                        : ownerFilter === "mine"
                            ? q.user.id === userId
                            : q.user.id !== userId;

                const matchesCategory =
                    categoryFilter === "all"
                        ? true
                        : q.category?.id?.toString() === categoryFilter;

                return matchesSearch && matchesOwner && matchesCategory;
            });

            setAllFilteredQuestions(filtered);
            const total = Math.ceil(filtered.length / questionPerPage);
            setTotalPage(total);
            const start = (page - 1) * questionPerPage;
            setQuestions(filtered.slice(start, start + questionPerPage));
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

    const handleDelete = async (id) => {
        try {
            const res = await QuestionService.delete(id);
            toast.success(res.data);
            setPage(1);
            await fetchQuestions();
        } catch (err) {
            toast.error("Xoá thất bại");
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
                                <SelectTrigger className="min-w-36 h-9 border">
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
                                <SelectTrigger className="min-w-48 h-9 border">
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

                    <Button
                        onClick={() => router.push("/users/dashboard")}
                        className="bg-gray-700 hover:bg-gray-600 text-white"
                    >
                        <ArrowLeft className="mr-2 w-4 h-4"/>
                        Quay lại
                    </Button>
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
                        className="pl-10 border"
                    />
                </div>

                <Separator/>

                {/* List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
            <span className="text-lg font-medium">
              Danh sách câu hỏi (Tổng: {allFilteredQuestions.length})
            </span>
                        <Button
                            onClick={() => router.push("/users/questions/create")}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
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
                            <Card key={q.id} className="bg-white hover:shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <h2 className="text-lg font-semibold text-purple-800">
                                            {idx + 1 + (page - 1) * questionPerPage}. {q.content}
                                        </h2>
                                        {q.user.id === userId && (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.push(`/users/questions/${q.id}/edit`)
                                                    }
                                                >
                                                    <Edit className="w-5 h-5"/>
                                                </Button>
                                                <DeleteButton
                                                    id={q.id}
                                                    handleDelete={handleDelete}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {q.image && (
                                        <img
                                            src={`${imageBaseUrl}${q.image}`}
                                            className="max-w-[33%] mt-2 cursor-pointer hover:scale-105 transition-transform"
                                            onClick={() => {
                                                setSelectedImage(`${imageBaseUrl}${q.image}`);
                                                setModalOpen(true);
                                            }}
                                        />
                                    )}
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
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
                                            <span className="text-sm">{a.content}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Pagination */}
                <div className="flex justify-center gap-3 mt-6">
                    {page > 1 && (
                        <Button variant="outline" onClick={() => setPage(page - 1)}>
                            Trang trước
                        </Button>
                    )}
                    <Button disabled>
                        {page}/{totalPage}
                    </Button>
                    {page < totalPage && (
                        <Button variant="outline" onClick={() => setPage(page + 1)}>
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
