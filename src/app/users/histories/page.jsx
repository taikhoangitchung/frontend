"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HistoryService from "../../../services/HistoryService";
import { toast } from "sonner";
import { ArrowLeft, Timer, CheckCircle, Pencil, X, Loader2 } from "lucide-react";
import ListHistory from "../../../components/histories/ListHistory";
import DetailHistory from "../../../components/histories/DetailHistory";
import RoomRankingPanel from "../../../components/exam/RankingList";
import { Button } from "../../../components/ui/button";

const HistoryPage = () => {
    const router = useRouter();
    const [historyList, setHistoryList] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedHistoryId, setSelectedHistoryId] = useState(null);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false); // Đặt mặc định là false để tránh loading ban đầu
    const [activeTab, setActiveTab] = useState("completed");
    const pageSize = 12;

    useEffect(() => {
        setLoading(true);
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
    }, [currentPage, activeTab]);

    useEffect(() => {
        const fetchRoomCode = async () => {
            if (selectedHistoryId !== null && activeTab === "created") {
                try {
                    const response = await HistoryService.getRoomByHistoryId(selectedHistoryId);
                    setCode(response.data.code);
                } catch (error) {
                    toast.error(error?.response?.data || "Lỗi khi lấy lịch sử theo id");
                }
            } else {
                setCode(""); // Đặt lại code nếu không còn selectedHistoryId
            }
        };

        fetchRoomCode();
    }, [selectedHistoryId, activeTab]); // Thêm activeTab để reset khi chuyển tab

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await HistoryService.getAll(currentPage, pageSize);
            const { content, totalPages } = response.data;
            setHistoryList(content);
            setTotalPages(totalPages);
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

    const historyCreateByMe = async () => {
        setLoading(true);
        try {
            const response = await HistoryService.getALlCreateByMe(currentPage, pageSize);
            const { content, totalPages } = response.data;
            setHistoryList(content);
            setTotalPages(totalPages);
        } catch (error) {
            toast.error(error?.response?.data || "Lỗi khi lấy kết quả phòng thi bạn tạo");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
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
        setSelectedHistoryId(null); // Reset selectedHistoryId khi chuyển tab
        setCode(""); // Reset code khi chuyển tab
    };

    const handleCloseRanking = () => {
        setCode("");
        setSelectedHistoryId(null);
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
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-white">Quay lại</span>
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="mb-8">
                    <div className="flex space-x-8 border-b border-gray-200">
                        <button
                            onClick={() => handleTabChange("completed")}
                            className={`pb-4 px-2 text-sm font-medium transition-all duration-200 relative cursor-pointer hover:text-orange-600 ${
                                activeTab === "completed"
                                    ? "text-orange-600 border-b-2 border-orange-600"
                                    : "text-gray-500"
                            }`}
                        >
                            <CheckCircle size={16} className="inline-block mr-2" />
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
                            <Pencil size={16} className="inline-block mr-2" />
                            Tạo
                        </button>
                    </div>
                </div>

                {(activeTab === "completed" || activeTab === "created") && (
                    <>
                        <ListHistory
                            currentPage={currentPage}
                            handlePageChange={handlePageChange}
                            historyList={historyList}
                            totalPages={totalPages}
                            handleOpenModalDetailHistory={handleOpenModal}
                            page={activeTab}
                            loading={loading} // Truyền trạng thái loading
                        />
                        {/* Pagination */}
                        <div className="flex justify-center gap-3 mt-6">
                            {currentPage > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="transition-all duration-200 cursor-pointer hover:bg-purple-100"
                                >
                                    Trang trước
                                </Button>
                            )}
                            <Button disabled>
                                {currentPage + 1}/{totalPages}
                            </Button>
                            {currentPage < totalPages - 1 && (
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="transition-all duration-200 cursor-pointer hover:bg-purple-100"
                                >
                                    Trang sau
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </div>
            {activeTab === "completed" && selectedHistoryId && (
                <DetailHistory selectedHistoryId={selectedHistoryId} handleCloseModal={handleCloseModal} />
            )}
            {activeTab === "created" && code && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
                    style={{ display: code ? "flex" : "none" }} // Thêm điều kiện hiển thị
                >
                    <button
                        onClick={handleCloseRanking}
                        className="absolute top-4 left-4 text-white hover:text-red-500 p-2 rounded-full z-50 bg-black/30 cursor-pointer transition-all duration-200"
                    >
                        <X className="w-10 h-10" />
                    </button>
                    <div className="rounded-xl p-6 max-w-6xl w-full grid gap-6 overflow-y-auto max-h-[90vh]">
                        <div className="min-w-0">
                            <RoomRankingPanel code={code} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;