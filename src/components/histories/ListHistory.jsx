import formatTime from "../../util/formatTime";
import {CheckCircle, XCircle} from "lucide-react";

const formatDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) return "Không xác định";
    try {
        const [yyyy, mm, dd] = dateArray; // Lấy năm, tháng, ngày từ mảng
        return `${String(dd).padStart(2, '0')}/${String(mm).padStart(2, '0')}/${yyyy}`;
    } catch (error) {
        console.error("Lỗi định dạng ngày:", dateArray, error);
        return "Không xác định";
    }
};

function ListHistory({
                         historyList, totalPages, currentPage,
                         handlePageChange,
                         handleOpenModalDetailHistory, page
                     }) {

    return (
        <>
            {historyList.length === 0 ? (
                <p className="text-gray-600">Bạn chưa thực hiện bài thi nào.</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {historyList.map((history, index) => (
                            <div
                                key={index}
                                className="bg-white shadow-lg rounded-xl p-0 transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] relative overflow-hidden cursor-pointer"
                                onClick={() => handleOpenModalDetailHistory(history.historyId)}
                            >
                                <div className="w-full h-36 rounded-t-xl overflow-hidden relative group">
                                    <img
                                        src="/cardquiz.png"
                                        alt={history.examTitle}
                                        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                                    />

                                    <div
                                        className="absolute top-2 right-2 bg-white/80 rounded px-2 py-1 text-xs font-semibold text-purple-700 outline-none transition-colors group-hover:bg-white/90"
                                    >
                                        Lượt thi {history.attemptTime}
                                    </div>
                                    <div
                                        className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                                    ></div>
                                </div>

                                <div className="p-4">
                                    <div
                                        className="text-center text-base font-semibold text-gray-800 hover:text-gray-900 transition-colors duration-300 mb-4 h-10 flex items-center justify-center"
                                    >
                                            <span
                                                className="line-clamp-2 overflow-hidden text-ellipsis text-wrap"
                                            >
                                                {history.examTitle}
                                            </span>
                                    </div>

                                    {page === "completed" && !isNaN(history.score) &&
                                        <div className="mb-4">
                                            <div
                                                className={`w-full h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                                    history.score === 100 ? "bg-[#5de2a5]" : "bg-[#e2be5d]"
                                                }`}
                                            >
                                                Độ chính xác: {history.score.toFixed(1)}%
                                            </div>
                                        </div>
                                    }

                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Ngày thi:</span>
                                        <span>{formatDate(history.finishedAt)}</span>
                                    </div>

                                    {page === "created" &&
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Số người tham gia:</span>
                                            <span>{history.countMembers}</span>
                                        </div>
                                    }

                                    {page === "completed" &&
                                        <>
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span>Thời gian làm bài:</span>
                                                <span>{formatTime(history.timeTaken)}</span>
                                            </div>

                                            <div
                                                className={`text-sm font-semibold mt-2 flex items-center gap-1 ${
                                                    history.passed ? "text-green-600" : "text-red-600"
                                                }`}
                                            >
                                                {history.passed ? (
                                                    <>
                                                        <CheckCircle className="w-4 h-4"/>
                                                        Đạt
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-4 h-4"/>
                                                        Không đạt
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </>
    )
}

export default ListHistory;
