"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HistoryService from "../../../services/HistoryService";
import { toast } from "sonner";
import { ArrowLeft, Timer, CheckCircle, Pencil } from "lucide-react";
import ListHistory from "../../../components/histories/ListHistory";
import DetailHistory from "../../../components/histories/DetailHistory";

const HistoryPage = () => {
    const router = useRouter();
    const [allHistories, setAllHistories] = useState([]);
    const [historyList, setHistoryList] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedHistoryId, setSelectedHistoryId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("completed");
    const pageSize = 20;

    useEffect(() => {
        if (activeTab !== "completed") {
            setHistoryList([]);
            setTotalPages(0);
            setLoading(false);
            return;
        }
        fetchHistory();
    }, [currentPage, activeTab]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await HistoryService.getAll();
            let histories = response.data;

            // Sắp xếp theo finishedAt giảm dần (mới nhất lên trên)
            histories = histories.sort((a, b) => {
                const dateA = new Date(a.finishedAt[0], a.finishedAt[1] - 1, a.finishedAt[2], a.finishedAt[3], a.finishedAt[4], a.finishedAt[5]);
                const dateB = new Date(b.finishedAt[0], b.finishedAt[1] - 1, b.finishedAt[2], b.finishedAt[3], b.finishedAt[4], b.finishedAt[5]);
                return dateB - dateA; // Sắp xếp giảm dần
            });

            // Nhóm các lần thi theo examTitle và gán attemptTime (mới nhất là số lớn nhất)
            const examAttempts = {};
            histories.forEach((history) => {
                const examTitle = history.examTitle;
                if (!examAttempts[examTitle]) {
                    examAttempts[examTitle] = [];
                }
                examAttempts[examTitle].push(history); // Lưu toàn bộ history
            });

            // Gán attemptTime theo thứ tự giảm dần (mới nhất là max, cũ nhất là 1)
            histories = histories.map((history) => {
                const examTitle = history.examTitle;
                const attempts = examAttempts[examTitle];
                const index = attempts.findIndex((h) => h.historyId === history.historyId);
                const attemptTime = attempts.length - index; // Mới nhất là số lớn nhất, cũ nhất là 1
                return {
                    ...history,
                    attemptTime: attemptTime
                };
            });

            setAllHistories(histories);
            setTotalPages(Math.ceil(histories.length / pageSize));
            setHistoryList(histories.slice(currentPage * pageSize, (currentPage + 1) * pageSize));
        } catch (error) {
            toast.error(
                error.response?.status === 404
                    ? "Không tìm thấy lịch sử bài thi"
                    : "Lỗi khi lấy lịch sử bài thi"
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
            setHistoryList(allHistories.slice(page * pageSize, (page + 1) * pageSize));
        }
    };

    const handleOpenModal = (id) => {
        setSelectedHistoryId(id);
    };

    const handleCloseModal = () => {
        setSelectedHistoryId(null);
    };
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(0);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">Lịch sử thi của tôi</h1>
                    <button
                        onClick={() => router.push("/users/dashboard")}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs bg-gray-700 text-white hover:bg-gray-600 border border-gray-500 cursor-pointer h-9 px-4 py-2 hover:shadow-md"
                    >
                        <ArrowLeft className="w-4 h-4"/>
                        <span className="text-white">Quay lại</span>
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="mb-8">
                    <div className="flex space-x-8 border-b border-gray-200">
                        <button
                            onClick={() => handleTabChange("running")}
                            className={`pb-4 px-2 text-sm font-medium transition-all duration-200 relative cursor-pointer hover:text-orange-600 ${
                                activeTab === "running"
                                    ? "text-orange-600 border-b-2 border-orange-600"
                                    : "text-gray-500"
                            }`}
                        >
                            <Timer size={16} className="inline-block mr-2"/>
                            Đang chạy
                        </button>

                        <button
                            onClick={() => handleTabChange("completed")}
                            className={`pb-4 px-2 text-sm font-medium transition-all duration-200 relative cursor-pointer hover:text-orange-600 ${
                                activeTab === "completed"
                                    ? "text-orange-600 border-b-2 border-orange-600"
                                    : "text-gray-500"
                            }`}
                        >
                            <CheckCircle size={16} className="inline-block mr-2"/>
                            Hoàn thành
                        </button>

                        <button
                            onClick={() => handleTabChange("created")}
                            className={`pb-4 px-2 text-sm font-medium transition-all duration-200 relative cursor-pointer hover:text-orange-600 ${
                                activeTab === "created"
                                    ? "text-orange-600 border-b-2 border-orange-600"
                                    : "text-gray-500"
                            }`}
                        >
                            <Pencil size={16} className="inline-block mr-2"/>
                            Tạo
                        </button>
                    </div>
                </div>

                { activeTab === "completed" && <ListHistory currentPage={currentPage} handlePageChange={handlePageChange} historyList={historyList} totalPages={totalPages} handleOpenModalDetailHistory={handleOpenModal}/>}

            </div>
            {selectedHistoryId && <DetailHistory selectedHistoryId={selectedHistoryId} handleCloseModal={handleCloseModal} />}
        </div>
    );
};

export default HistoryPage;