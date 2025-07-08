"use client";

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import HistoryService from "../../../services/HistoryService";
import {toast} from "sonner";
import {ArrowLeft, Timer, CheckCircle, Pencil, X, Loader2} from "lucide-react";
import ListHistory from "../../../components/histories/ListHistory";
import DetailHistory from "../../../components/histories/DetailHistory";
import RoomRankingPanel from "../../../components/exam/RankingList";

const HistoryPage = () => {
    const router = useRouter();
    const [allHistories, setAllHistories] = useState([]);
    const [historyList, setHistoryList] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedHistoryId, setSelectedHistoryId] = useState(null);
    const [code, setCode] = useState("");

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("completed");
    const pageSize = 20;

    useEffect(() => {
        setLoading(true)
        switch (activeTab) {
            case "completed":
                fetchHistory();
                break;
            case "created":
                historyCreateByMe();
                break;
            default:
                setHistoryList([]);
                setTotalPages(0);
                setLoading(false);
        }
        setLoading(false)
    }, [currentPage, activeTab]);

    useEffect(() => {
        const fetchRoomCode = async () => {
            if (selectedHistoryId !== null && activeTab === "created") {
                try {
                    const response = await HistoryService.getRoomByHistoryId(selectedHistoryId)
                    setCode(response.data.code)
                } catch (error) {
                    toast.error(error?.response?.data || "Lỗi khi lấy lịch sử theo id")
                }
            }
        }

        fetchRoomCode()
    }, [selectedHistoryId]);

    const historyCreateByMe = async () => {
        try {
            const response = await HistoryService.getALlCreateByMe();
            const histories = response.data

            setAllHistories(histories);
            setTotalPages(Math.ceil(histories.length / pageSize));
            setHistoryList(histories.slice(currentPage * pageSize, (currentPage + 1) * pageSize));
        } catch (error) {
            toast.error(error?.response?.data || "Lỗi khi lấy kết quả phòng thi bạn tạo")
        }
    }

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

    const handleCloseRanking = () => {
        setCode("");
        setSelectedHistoryId(null);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-purple-900">
                <Loader2 className="h-8 w-8 animate-spin text-white"/>
            </div>
        )
    }

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

                {(activeTab === "completed" || activeTab === "created") &&
                    <ListHistory currentPage={currentPage}
                                 handlePageChange={handlePageChange}
                                 historyList={historyList}
                                 totalPages={totalPages}
                                 handleOpenModalDetailHistory={handleOpenModal}
                                 page={activeTab}
                    />}
            </div>
            {activeTab === "completed" && selectedHistoryId &&
                <DetailHistory selectedHistoryId={selectedHistoryId} handleCloseModal={handleCloseModal}/>}
            {activeTab === "created" && code
                && <>
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
                        <button
                            onClick={handleCloseRanking}
                            className="absolute top-4 left-4 text-white hover:text-red-500 p-2 rounded-full z-50 bg-black/30"
                        >
                            <X className="w-10 h-10" />
                        </button>

                        <div
                            className={`rounded-xl p-6 max-w-6xl w-full grid gap-6 overflow-y-auto max-h-[90vh]`}
                        >
                            <div className="min-w-0">
                                <RoomRankingPanel code={code} />
                            </div>
                        </div>
                    </div>
                </>
            }
        </div>
    );
};

export default HistoryPage;
