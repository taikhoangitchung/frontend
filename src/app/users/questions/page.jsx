"use client";

import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { Search, Plus, Edit, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import QuestionService from "../../../services/QuestionService";
import { toast } from "sonner";
import DeleteButton from "../../../components/alerts-confirms/DeleleButton";
import { typeVietSub } from "../../../util/typeVietsub";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function QuizInterface() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [ownerFilter, setOwnerFilter] = useState("all");
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const questionPerPage = 20;

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                const userId = parseInt(localStorage.getItem("id"));
                const res = await QuestionService.getAll();
                console.log(res);

                const filtered = res.data.filter((q) => {
                    const matchesSearch =
                        q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        q.answers.some((a) => a.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        q.user.username?.toLowerCase().includes(searchTerm.toLowerCase());

                    const matchesOwner =
                        ownerFilter === "all"
                            ? true
                            : ownerFilter === "mine"
                                ? q.user.id === userId
                                : q.user.id !== userId;

                    return matchesSearch && matchesOwner;
                });

                setTotalPage(Math.ceil(filtered.length / questionPerPage));
                const start = (page - 1) * questionPerPage;
                const end = start + questionPerPage;
                setQuestions(filtered.slice(start, end));
            } catch (error) {
                if (error.response?.status === 403) {
                    router.push("/forbidden");
                } else if (error.response?.status === 401) {
                    toast.error("Token hết hạn hoặc không hợp lệ. Đang chuyển hướng về trang đăng nhập...");
                    setTimeout(() => router.push("/login"), 2500);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [searchTerm, page, ownerFilter]);

    const handlePagination = (data) => {
        setTotalPage(Math.ceil(data.length / questionPerPage));
        const start = (page - 1) * questionPerPage;
        const end = start + questionPerPage;
        setQuestions(data.slice(start, end));
    };

    const handleDelete = async (id) => {
        try {
            const result = await QuestionService.delete(id);
            toast.success(result.data);
            setPage(1);
            fetchQuestions();
        } catch (error) {
            toast.error(error.response?.data || "Xoá thất bại");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-semibold text-gray-900">Tìm kiếm câu hỏi</h1>
                    <div className="flex items-center gap-3">
                        <Select value={ownerFilter} onValueChange={(value) => {
                            setOwnerFilter(value);
                            setPage(1);
                        }}>
                            <SelectTrigger className="w-32 h-9 border border-gray-300 rounded-md bg-white text-sm">
                                <SelectValue placeholder="Lọc theo tác giả" />
                            </SelectTrigger>
                            <SelectContent className="z-50 bg-white border border-gray-200 rounded-md shadow-md">
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="mine">Của tôi</SelectItem>
                                <SelectItem value="others">Người khác</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={() => router.push("/users/dashboard")}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs bg-gray-700 text-white hover:bg-gray-600 border border-gray-500 cursor-pointer transition-colors h-9 px-4 py-2"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 text-white" />
                            <span className="text-white">Quay lại</span>
                        </Button>
                    </div>
                </div>

                <div className="relative w-full mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Nhập nội dung câu hỏi, người tạo hoặc đáp án..."
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
                        <span className="text-lg font-medium">Danh sách câu hỏi (Tổng: {questions.length})</span>
                        <Button
                            onClick={() => router.push("/users/questions/create")}
                            className="bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300"
                            variant="outline"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo mới
                        </Button>
                    </div>

                    {questions.map((question, index) => (
                        <Card key={question.id} className="border border-gray-200 hover:cursor-pointer">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span className="font-medium">{index + 1} - {typeVietSub(question.type.name)}</span>
                                    </div>
                                    <div className="ml-auto flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-1"
                                            onClick={() => router.push(`/users/questions/${question.id}/edit`)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <DeleteButton id={question.id} handleDelete={handleDelete} />
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <h2 className="text-2xl font-bold mb-4 text-purple-800">{index + 1}. {question.content}</h2>
                                <div className="text-sm text-gray-500">
                                    Người tạo: <span className="font-semibold text-gray-700">{question.user.username}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {question.answers.map((answer) => (
                                        <div
                                            key={answer.id}
                                            className={`flex items-center gap-2 p-3 rounded-lg border border-gray-200 ${
                                                answer.correct ? "bg-green-50 border-green-200" : "bg-red-50 bg-opacity-20 border-red-200"
                                            } hover:cursor-pointer`}
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
                    ))}
                </div>

                <div className="flex justify-center items-center py-4 px-4 gap-2 border-t border-gray-100">
                    {page > 1 && (
                        <Button variant="outline" onClick={() => setPage(page - 1)} className="text-sm">
                            Trang trước
                        </Button>
                    )}
                    <Button className="text-blue-700" disabled>{page}/{totalPage}</Button>
                    {page < totalPage && (
                        <Button variant="outline" onClick={() => setPage(page + 1)} className="text-sm">
                            Trang sau
                        </Button>
                    )}
                </div>

                {loading && (
                    <div className="flex justify-center py-8 text-gray-500">Đang tải câu hỏi...</div>
                )}
                {!loading && questions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <Search className="w-12 h-12 mb-4 opacity-50" />
                        <p>Không tìm thấy câu hỏi nào phù hợp</p>
                    </div>
                )}
            </div>
        </div>
    );
}