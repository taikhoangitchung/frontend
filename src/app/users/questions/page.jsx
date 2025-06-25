"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { Search, Plus, Edit, X, Check, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import QuestionService from "../../../services/QuestionService";
import { toast } from "sonner";
import DeleteButton from "../../../components/alerts-confirms/DeleleButton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";

const Modal = ({ onClose, children }) => {
    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onClick={onClose}
        >
            <div
                className="bg-white p-4 rounded-md relative max-w-lg"
                onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện click từ việc đóng modal
            >
                <button className="absolute top-2 right-2" onClick={onClose}>
                    <X className="w-5 h-5" />
                </button>
                {children}
            </div>
        </div>
    );
};

export default function QuizInterface() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [ownerFilter, setOwnerFilter] = useState("all");
    const [questions, setQuestions] = useState([]);
    const [allFilteredQuestions, setAllFilteredQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [userId, setUserId] = useState(undefined);
    const questionPerPage = 20;
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");

    useEffect(() => {
        const storedId = parseInt(localStorage.getItem("id") || "0");
        setUserId(storedId);
    }, []);

    const fetchQuestions = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await QuestionService.getAll();

            const filtered = res.data.filter((q) => {
                const matchesSearch =
                    q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    q.answers.some((a) =>
                        a.content.toLowerCase().includes(searchTerm.toLowerCase())
                    ) ||
                    q.user.username?.toLowerCase().includes(searchTerm.toLowerCase());

                const matchesOwner =
                    ownerFilter === "all"
                        ? true
                        : ownerFilter === "mine"
                            ? q.user.id === userId
                            : q.user.id !== userId;

                return matchesSearch && matchesOwner;
            });

            setAllFilteredQuestions(filtered);
            const total = Math.ceil(filtered.length / questionPerPage);
            setTotalPage(total);
            const start = (page - 1) * questionPerPage;
            const end = start + questionPerPage;
            setQuestions(filtered.slice(start, end));
        } catch (error) {
            if (error.response?.status === 403) {
                router.push("/forbidden");
            } else if (error.response?.status === 401) {
                toast.error(
                    "Token hết hạn hoặc không hợp lệ. Đang chuyển hướng về trang đăng nhập..."
                );
                setTimeout(() => router.push("/login"), 2500);
            } else {
                toast.error("Đã xảy ra lỗi khi tải câu hỏi!");
            }
        } finally {
            setLoading(false);
        }
    }, [searchTerm, ownerFilter, page, userId]);

    useEffect(() => {
        if (userId !== undefined) {
            fetchQuestions();
        }
    }, [fetchQuestions, userId]);

    const handleDelete = async (id) => {
        try {
            const result = await QuestionService.delete(id);
            toast.success(result.data);
            setPage(1); // reset về trang đầu sau khi xóa
            setTimeout(() => {
                fetchQuestions();
            }, 100);
        } catch (error) {
            toast.error(error.response?.data || "Xoá thất bại");
        }
    };

    const imageBaseUrl = "http://localhost:8080"; // Tiền tố cho đường dẫn ảnh

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Tìm kiếm câu hỏi
                        </h1>
                        <Select
                            value={ownerFilter}
                            onValueChange={(value) => {
                                setOwnerFilter(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="min-w-36 h-9 border border-gray-300 rounded-md bg-white text-sm cursor-pointer transition-all duration-200">
                                <SelectValue placeholder="Lọc theo tác giả" />
                            </SelectTrigger>
                            <SelectContent className="z-50 min-w-36 bg-white border border-gray-200 rounded-md shadow-md">
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="mine">Của tôi</SelectItem>
                                <SelectItem value="others">Của người khác</SelectItem>
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

                <div className="relative w-full mb-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 w-4 h-4"/>
                    <Input
                        placeholder="Nhập nội dung câu hỏi, người tạo hoặc đáp án..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="pl-10 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-200 border border-gray-500"
                    />
                </div>

                <Separator/>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">
                            Danh sách câu hỏi (Tổng: {allFilteredQuestions.length})
                        </span>
                        <Button
                            onClick={() => router.push("/users/questions/create")}
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
                            <span className="ml-3 text-gray-500">Đang tải câu hỏi...</span>
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Search className="w-12 h-12 mb-4 opacity-50" />
                            <p>Không tìm thấy câu hỏi nào phù hợp</p>
                        </div>
                    ) : (
                        questions.map((question, index) => (
                            <Card
                                key={question.id}
                                className="border border-gray-200 hover:shadow-md transition-all duration-200 bg-white"
                            >
                                <CardHeader className="pb-0">
                                    <div className="flex items-start justify-between">
                                        <h2 className="text-xl sm:text-2xl font-bold text-purple-800">
                                            {index + 1 + (page - 1) * questionPerPage}.{" "}
                                            {question.content}
                                        </h2>
                                        {question.user.id === userId && (
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="p-1"
                                                    onClick={() =>
                                                        router.push(`/users/questions/${question.id}/edit`)
                                                    }
                                                >
                                                    <Edit className="w-6 h-6"/>
                                                </Button>
                                                <DeleteButton id={question.id} handleDelete={handleDelete}/>
                                            </div>
                                        )}
                                    </div>
                                    {question.image && (
                                        <div className="mt-2 flex justify-center">
                                            <img
                                                src={`${imageBaseUrl}${question.image}`}
                                                alt="Question image"
                                                className="max-w-[33%] h-auto cursor-pointer transition-transform duration-200 hover:scale-105"
                                                onClick={() => handleImageClick(`${imageBaseUrl}${question.image}`)}
                                            />
                                        </div>
                                    )}
                                </CardHeader>

                                <CardContent className="space-y-4 mt-2">
                                    <div className="text-sm text-gray-500">
                                        Người tạo:{" "}
                                        <span className="font-semibold text-gray-700">
                                            {question.user.username}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {question.answers.map((answer) => (
                                            <div
                                                key={answer.id}
                                                className={`flex items-center gap-2 p-3 rounded-lg border ${
                                                    answer.correct
                                                        ? "bg-green-50 border-green-200"
                                                        : "bg-red-50 bg-opacity-20 border-red-200"
                                                }`}
                                            >
                                                {answer.correct ? (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <X className="w-4 h-4 text-red-400 opacity-50" />
                                                )}
                                                <span className="text-sm">{answer.content}</span>
                                            </div>
                                        ))}
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

            {/* Modal cho hình ảnh lớn */}
            {modalOpen && (
                <Modal onClose={() => setModalOpen(false)}>
                    <img
                        src={selectedImage}
                        alt="Enlarged Question"
                        className="max-w-full h-auto"
                    />
                </Modal>
            )}
        </div>
    );
}