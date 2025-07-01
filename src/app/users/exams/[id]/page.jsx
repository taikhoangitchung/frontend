"use client";

import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { X, Check, Loader2, ArrowLeft, ChevronDown } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState} from "react";
import ExamService from "../../../../services/ExamService";
import { Badge } from "../../../../components/ui/badge";
import { toast } from "sonner"; // Giả sử bạn dùng sonner để thông báo

const questionPerPage = 10;

export default function Page() {
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [page, setPage] = useState(1);
    const [expandedIds, setExpandedIds] = useState([]);
    const [selectedImage, setSelectedImage] = useState("");
    const [modalOpen, setModalOpen] = useState(false);

    const imageBaseUrl = "https://quizgymapp.onrender.com";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await ExamService.getToPlayById(id);
                setQuestions(response.data.questions || []);
            } catch (error) {
                toast.error("Không thể tải câu hỏi: " + (error.response?.data || error.message));
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const toggleExpand = (id) => {
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const totalPage = Math.ceil(questions.length / questionPerPage);
    const start = (page - 1) * questionPerPage;
    const pagedQuestions = questions.slice(start, start + questionPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-purple-900">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

    if (!questions.length) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p className="text-gray-500">Không có câu hỏi nào để hiển thị.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8">
            <div className="max-w-5xl mx-auto space-y-4">
                <div className="flex justify-between mb-2">
                    <span className="text-lg font-medium">
                        Danh sách câu hỏi (Tổng: {questions.length})
                    </span>
                    <button
                        onClick={() => router.push("/users/dashboard")}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs bg-gray-700 text-white hover:bg-gray-600 border border-gray-500 cursor-pointer h-9 px-4 py-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-white">Quay lại</span>
                    </button>
                </div>

                <div className="space-y-4 pt-4">
                    {pagedQuestions.map((q, index) => (
                        <Card
                            key={q.id}
                            className="bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer hover:ring-1 hover:scale-[1.01] hover:ring-teal-300 pt-3 pb-3 gap-0 mb-2"
                            onClick={() => toggleExpand(q.id)} // Mở/đóng khi click vào card
                        >
                            <CardHeader className="gap-0 !pb-0 px-6">
                                <div className="flex justify-between items-start gap-2">
                                    <h2 className="text-lg font-semibold text-purple-800 flex-1 whitespace-pre-wrap">
                                        {index + 1 + (page - 1) * questionPerPage}.{" "}
                                        {typeof q.content === "string" ? q.content.replace(/\\n/g, "\n") : q.content}
                                    </h2>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="cursor-pointer text-gray-500 hover:text-teal-700 hover:bg-black/10 px-2 py-1 transition-all duration-200"
                                        title="Xem đáp án"
                                    >
                                        <ChevronDown
                                            className={`h-4 w-4 transform transition-transform duration-200 ${expandedIds.includes(q.id) ? "rotate-180" : ""}`}
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
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Ngăn sự kiện lan ra khi click vào hình
                                                    setSelectedImage(`${imageBaseUrl}${q.image}`);
                                                    setModalOpen(true);
                                                }}
                                                alt="image"
                                            />
                                        </div>
                                    )}
                                    {q.answers && q.answers.length > 0 ? (
                                        q.answers.map((a) => (
                                            <div
                                                key={a.id}
                                                className={`flex items-center gap-2 p-3 rounded-lg border ${
                                                    a.correct
                                                        ? "bg-green-50 border-green-200"
                                                        : "bg-red-50 bg-opacity-20 border-red-200"
                                                }`}
                                            >
                                                {a.correct ? (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <X className="w-4 h-4 text-red-400 opacity-50" />
                                                )}
                                                <span className="text-sm">{a.content || "Không có nội dung đáp án"}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-gray-500">Không có đáp án để hiển thị.</div>
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
                                            <span className="text-sm whitespace-pre-wrap">
  {typeof a.content === "string" ? a.content.replace(/\\n/g, "\n") : a.content}
</span>
                                        </div>
                                    ))}

                                    <div className="col-span-full flex flex-wrap gap-2 mt-1">
                                        <Badge
                                            variant="outline"
                                            className="text-xs border-teal-300 text-teal-700 bg-teal-50"
                                        >
                                            {q.category?.name || "Chưa có danh mục"}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="text-xs border-purple-300 text-purple-700 bg-purple-50"
                                        >
                                            {q.difficulty?.name || "Chưa có độ khó"}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="text-xs border-gray-300 text-gray-600"
                                        >
                                            {q.user?.username || "Chưa có người tạo"}
                                        </Badge>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
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

            {/* Image Modal */}
            {modalOpen && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button
                            variant="ghost"
                            className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white text-1xl font-semibold z-10 rounded-full w-9 h-9 flex items-center justify-center"
                            onClick={() => setModalOpen(false)}
                        >
                            ✕
                        </Button>
                        <img
                            src={selectedImage}
                            alt="Question"
                            className="w-full h-full max-h-[90vh] object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}