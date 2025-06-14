"use client";

import { useEffect, useState } from "react";
import QuestionService from "../../../services/QuestionService";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const MyQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [isExpand, setIsExpand] = useState(-1);
    const router = useRouter();

    const questionPerPage = 5;

    useEffect(() => {
        setIsLoading(true);

        const fetchQuestions = async () => {
            try {
                const res = await QuestionService.findAllByUser(1);
                const allQuestions = res.data;
                setTotalPage(Math.ceil(allQuestions.length / questionPerPage));
                const start = (page - 1) * questionPerPage;
                const end = start + questionPerPage;
                const thisPageItems = allQuestions.slice(start, end);
                setQuestions(thisPageItems);
            } catch (error) {
                console.error("Lỗi khi tải câu hỏi:", error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, [page]);

    const handleExpand = (id) => {
        setIsExpand(isExpand === id ? -1 : id);
    };

    const handleEdit = (id) => {
        router.push(`/questions/edit/${id}`);
    };

    const handleDelete = async (id) => {
        if (confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
            try {
                await QuestionService.delete(id);
                toast.success("Đã xóa câu hỏi.");
                setQuestions((prev) => prev.filter((q) => q.id !== id));
            } catch (err) {
                toast.error(err.response.data);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-6">
            <h2 className="text-2xl font-bold mb-4">Danh sách câu hỏi của tôi</h2>

            {isLoading ? (
                <p className="text-center">Đang tải...</p>
            ) : (
                <ul className="space-y-4">
                    {questions.map((question) => (
                        <li
                            key={question.id}
                            className="p-4 rounded-xl shadow-md bg-white border border-gray-200 transition hover:shadow-lg"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium">{question.content}</p>
                                    <p className="text-sm text-gray-500 italic">{question.type?.name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleEdit(question.id)}>Sửa</Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(question.id)}>Xóa</Button>
                                </div>
                            </div>

                            <button
                                onClick={() => handleExpand(question.id)}
                                className="text-blue-600 text-sm mt-2 hover:underline"
                            >
                                {isExpand === question.id ? "Ẩn đáp án" : "Xem đáp án"}
                            </button>

                            {isExpand === question.id && (
                                <ul className="mt-2 space-y-1">
                                    {question.answers.map((answer) => (
                                        <li
                                            key={answer.id}
                                            className={`px-3 py-2 rounded ${
                                                answer.correct
                                                    ? "bg-green-100 text-green-800 font-medium"
                                                    : "bg-gray-100"
                                            }`}
                                        >
                                            {answer.content}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {/* Pagination */}
            <div className="flex justify-center items-center gap-3 mt-6">
                {page > 1 && (
                    <Button variant="outline" onClick={() => setPage(page - 1)}>
                        Trang trước
                    </Button>
                )}
                <span className="text-sm">Trang {page} / {totalPage}</span>
                {page < totalPage && (
                    <Button variant="outline" onClick={() => setPage(page + 1)}>
                        Trang tiếp
                    </Button>
                )}
            </div>
        </div>
    );
};

export default MyQuestions;
