"use client"

import {Card, CardContent, CardHeader} from "../../../../components/ui/card";
import {Button} from "../../../../components/ui/button";
import {X, Check, Loader2, ArrowLeft, ChevronDown} from "lucide-react";
import {useParams, useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import ExamService from "../../../../services/ExamService";
import {Badge} from "../../../../components/ui/badge";

const questionPerPage = 10;

export default function Page() {
    const router = useRouter();
    const {id} = useParams();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [page, setPage] = useState(1);
    const [expandedIds, setExpandedIds] = useState([]);
    const [selectedImage, setSelectedImage] = useState("");
    const [modalOpen, setModalOpen] = useState(false);

    const imageBaseUrl = "http://localhost:8080";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await ExamService.getToPlayById(id);
                setQuestions(response.data.questions);
            } catch (error) {
                console.log(error);
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
                <Loader2 className="h-8 w-8 animate-spin text-white"/>
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
                    <Button
                        onClick={() => router.push("/users/exams")}
                        className="bg-gray-700 hover:bg-gray-600 text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2"/>
                        Quay lại
                    </Button>
                </div>

                <div className="space-y-4">
                    {pagedQuestions.map((q, index) => (
                        <Card key={q.id} className="bg-white transition-all duration-200
                            hover:shadow-lg hover:-translate-y-1 hover:ring-1 hover:scale-[1.01]
                            hover:ring-teal-300 pt-3 pb-3 gap-0 mb-2">
                            <CardHeader className="gap-0 !pb-0 px-6">
                                <div className="flex justify-between items-start gap-2">
                                    <h2 className="text-lg font-semibold text-purple-800 flex-1 whitespace-pre-wrap">
                                        {index + 1 + (page - 1) * questionPerPage}.{" "}
                                        {typeof q.content === "string" ? q.content.replace(/\\n/g, "\n") : q.content}
                                    </h2>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleExpand(q.id)}
                                        className="cursor-pointer text-gray-500 hover:text-teal-700 hover:bg-teal-50 px-2 py-1 transition-all duration-200"
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
                                            {q.category?.name}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="text-xs border-purple-300 text-purple-700 bg-purple-50"
                                        >
                                            {q.difficulty?.name}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="text-xs border-gray-300 text-gray-600"
                                        >
                                            {q.user?.username}
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
