"use client";

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import HistoryService from "../../../services/HistoryService";
import {toast} from "sonner";
import {ArrowLeft, Timer, CheckCircle, Pencil, XCircle} from "lucide-react";
import formatTime from "../../../util/formatTime";


const HistoryPage = () => {
    const router = useRouter();
    const [allHistories, setAllHistories] = useState([]);
    const [historyList, setHistoryList] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
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

        const fetchHistory = async () => {
            setLoading(true);
            try {
                const response = await HistoryService.getAll();
                const histories = response.data;
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
        fetchHistory();
    }, [currentPage, activeTab]);

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
            setHistoryList(allHistories.slice(page * pageSize, (page + 1) * pageSize));
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="space-y-4 w-full max-w-7xl px-6">
                    {[...Array(4)].map((_, index) => (
                        <div
                            key={index}
                            className="bg-white animate-pulse rounded-xl shadow-lg p-4 h-48 flex items-center justify-center"
                        >
                            <div className="w-full h-32 bg-gray-200 rounded-t-xl"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">Lịch sử thi của tôi</h1>
                    <button
                        onClick={() => router.push("/users/dashboard")}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs bg-gray-700 text-white hover:bg-gray-600 border border-gray-500 cursor-pointer h-9 px-4 py-2"
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
                            className={`pb-4 px-2 text-sm font-medium transition-colors duration-200 relative ${
                                activeTab === "running"
                                    ? "text-orange-600 border-b-2 border-orange-600"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <Timer size={16} className="inline-block mr-2"/>
                            Đang chạy
                        </button>

                        <button
                            onClick={() => handleTabChange("completed")}
                            className={`pb-4 px-2 text-sm font-medium transition-colors duration-200 relative ${
                                activeTab === "completed"
                                    ? "text-orange-600 border-b-2 border-orange-600"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <CheckCircle size={16} className="inline-block mr-2"/>
                            Hoàn thành
                        </button>

                        <button
                            onClick={() => handleTabChange("created")}
                            className={`pb-4 px-2 text-sm font-medium transition-colors duration-200 relative ${
                                activeTab === "created"
                                    ? "text-orange-600 border-b-2 border-orange-600"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <Pencil size={16} className="inline-block mr-2"/>
                            Tạo
                        </button>
                    </div>
                </div>

                {activeTab !== "completed" ? (
                    <div className="text-gray-600 text-center py-10">
                        Chức năng đang phát triển...
                    </div>
                ) : historyList.length === 0 ? (
                    <p className="text-gray-600">Bạn chưa thực hiện bài thi nào.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {historyList.map((history) => (
                                <div
                                    key={history.id}
                                    className="bg-white shadow-lg rounded-xl p-0 transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] relative overflow-hidden cursor-pointer"
                                    onClick={() => router.push(`/users/histories/${history.id}`)}
                                >
                                    <div className="w-full h-36 rounded-t-xl overflow-hidden relative group">
                                        <img
                                            src="/cardquiz.png"
                                            alt={history.examTitle}
                                            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                                        />

                                        <div
                                            className="absolute top-2 right-2 bg-white/80 rounded px-2 py-1 text-xs font-semibold text-purple-700 outline-none transition-colors group-hover:bg-white/90">
                                            Lượt thi {history.attemptTime}
                                        </div>
                                        <div
                                            className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                                    </div>

                                    <div className="p-4">
                                        <div
                                            className="text-center text-base font-semibold text-gray-800 hover:text-gray-900 transition-colors duration-300 mb-4 h-10 flex items-center justify-center">
                                            <span
                                                className="line-clamp-2 overflow-hidden text-ellipsis text-wrap">{history.examTitle}</span>
                                        </div>

                                        <div className="mb-4">
                                            <div
                                                className={`w-full h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                                    history.score === 100 ? "bg-[#5de2a5]" : "bg-[#e2be5d]"
                                                }`}
                                            >
                                                Độ chính xác: {history.score.toFixed(1)}%
                                            </div>
                                        </div>

                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Ngày thi:</span>
                                            <span>{new Date(history.finishedAt).toLocaleString("vi-VN")}</span>
                                        </div>

                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Thời gian làm bài:</span>
                                            <span>{formatTime(history.timeTaken)}</span>
                                        </div>

                                        <div className={`text-sm font-semibold mt-2 flex items-center gap-1 ${history.passed ? "text-green-600" : "text-red-600"}`}>
                                            {history.passed ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4" />
                                                    Đạt
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-4 h-4" />
                                                    Không đạt
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex justify-center">
                            <nav className="inline-flex rounded-md shadow">
                                {totalPages <= 3 || currentPage < 2 || currentPage >= totalPages - 2 ? (
                                    <>
                                        {currentPage > 0 && (
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                className="px-4 py-2 border border-gray-300 text-sm font-medium bg-white text-gray-700 hover:bg-purple-600 hover:text-white transition-colors rounded-l-md"
                                            >
                                                Trước
                                            </button>
                                        )}
                                        {Array.from({length: totalPages}, (_, i) => i).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-4 py-2 border border-gray-300 text-sm font-medium ${
                                                    currentPage === page
                                                        ? "bg-purple-600 text-white"
                                                        : "bg-white text-gray-700 hover:bg-purple-600 hover:text-white transition-colors"
                                                } rounded-md`}
                                            >
                                                {page + 1}
                                            </button>
                                        ))}
                                        {currentPage < totalPages - 1 && (
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                className="px-4 py-2 border border-gray-300 text-sm font-medium bg-white text-gray-700 hover:bg-purple-600 hover:text-white transition-colors rounded-r-md"
                                            >
                                                Sau
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            className="px-4 py-2 border border-gray-300 text-sm font-medium bg-white text-gray-700 hover:bg-purple-600 hover:text-white transition-colors rounded-l-md"
                                        >
                                            Trước
                                        </button>
                                        {Array.from(
                                            {length: Math.min(5, totalPages)},
                                            (_, i) => currentPage - 2 + i
                                        )
                                            .filter((page) => page >= 0 && page < totalPages)
                                            .map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-4 py-2 border border-gray-300 text-sm font-medium ${
                                                        currentPage === page
                                                            ? "bg-purple-600 text-white"
                                                            : "bg-white text-gray-700 hover:bg-purple-600 hover:text-white transition-colors"
                                                    } rounded-md`}
                                                >
                                                    {page + 1}
                                                </button>
                                            ))}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            className="px-4 py-2 border border-gray-300 text-sm font-medium bg-white text-gray-700 hover:bg-purple-600 hover:text-white transition-colors rounded-r-md"
                                        >
                                            Sau
                                        </button>
                                    </>
                                )}
                            </nav>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;