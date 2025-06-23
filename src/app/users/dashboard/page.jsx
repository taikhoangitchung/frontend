"use client"

import UserHeader from "../../../components/layout/UserHeader";
import {Card, CardContent} from "../../../components/ui/card";
import {Input} from "../../../components/ui/input";
import {Button} from "../../../components/ui/button";
import {Medal, Users, Zap} from 'lucide-react';
import {toast} from "sonner";
import ExamSummaryCard from "../../../components/exam/ExamSummaryCard";
import {useEffect, useState} from "react";
import HistoryService from "../../../services/HistoryService";
import ExamPrePlayCard from "../../../components/exam/ExamPrePlayCard";

export default function Page() {
    const [searchTerm, setSearchTerm] = useState("");
    const username = localStorage.getItem("username");
    const [playedCount, setPlayedCount] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [selectedExam, setSelectedExam] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await HistoryService.getHistory();
                const histories = response.data || [];

                const played = histories.length;
                const totalScore = histories.reduce((sum, h) => sum + h.score, 0);
                const avgScore = played > 0 ? (totalScore / played).toFixed(1) : 0;

                setPlayedCount(played);
                setAccuracy(avgScore);
            } catch (e) {
                console.error("Lỗi khi tính thống kê người dùng");
            }
        };
        fetchStats();
    }, []);

    const handleCloseModal = () => {
        setSelectedExam(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header Component */}
            <UserHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                    {/* Left - Join Quiz */}
                    <div className="flex-1 flex flex-col">
                        <Card className="flex-1 bg-white shadow-lg rounded-xl border-0 overflow-hidden">
                            <CardContent className="p-8 flex flex-col justify-center">
                                <div className="space-y-5 max-w-md w-full mx-auto">
                                    <Input
                                        placeholder="Nhập mã quiz để vào phòng thi"
                                        className="h-14 text-lg text-center font-mono border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl uppercase transition-all"
                                        maxLength={8}
                                        onChange={(e) => (e.target.value = e.target.value.toUpperCase())}
                                    />
                                    <Button
                                        className="w-full h-14 text-lg font-medium bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl shadow transition-transform hover:scale-105"
                                        onClick={() => toast.info("Chức năng đang được phát triển...")}
                                    >
                                        <Zap className="w-5 h-5 mr-2" />
                                        Tham gia ngay
                                    </Button>

                                    <div className="text-center">
                                        <p className="text-sm text-gray-400 mb-2">Hoặc</p>
                                        <Button
                                            variant="outline"
                                            className="text-purple-600 border border-purple-200 hover:bg-purple-50 text-sm font-medium rounded-lg"
                                            onClick={() => toast.info("Chức năng đang được phát triển...")}
                                        >
                                            <Users className="w-4 h-4 mr-2" />
                                            Tạo phòng mới
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right - User Info */}
                    <div className="flex-1 flex flex-col">
                        <Card className="flex-1 bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-600 border-0 shadow-xl rounded-xl overflow-hidden">
                            <CardContent className="p-6 flex flex-col justify-between h-full relative">
                                <div>
                                    <div className="mb-6 flex items-baseline gap-2">
                                        <h3 className="text-base font-medium text-white/90">Xin chào,</h3>
                                        <h2 className="text-xl font-bold text-white truncate max-w-[180px]">{username}</h2>
                                    </div>

                                    <div className="flex items-center justify-between bg-white/10 rounded-lg p-3 border border-white/20 mb-6">
                                        <span className="text-white/80 text-sm">Thành tích</span>
                                        <Medal className="w-6 h-6 text-yellow-400" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Card className="bg-white shadow-md rounded-lg border-0">
                                            <CardContent className="p-3 text-center">
                                                <div className="text-xl font-bold text-purple-600">{playedCount}</div>
                                                <div className="text-sm text-gray-500">Đã chơi</div>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-white shadow-md rounded-lg border-0">
                                            <CardContent className="p-3 text-center">
                                                <div className="text-xl font-bold text-green-600">{accuracy}%</div>
                                                <div className="text-sm text-gray-500">Tỷ lệ đúng</div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <ExamSummaryCard search={searchTerm} onExamClick={setSelectedExam}/>
            </main>
            {selectedExam && (
                <div
                    className="fixed inset-0 bg-opacity-5 backdrop-blur-xs flex items-center justify-center z-50"
                    onClick={handleCloseModal}
                >
                    <ExamPrePlayCard exam={selectedExam} onClose={handleCloseModal}/>
                </div>
            )}
        </div>
    )
}