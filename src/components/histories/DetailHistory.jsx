import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import ExamResultSummary from "../exam/ExamResultSummary";

function DetailHistory({ handleCloseModal, selectedHistoryId }) {
    const modalRef = useRef(null);

    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            handleCloseModal();
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                key="modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                onClick={handleOverlayClick} // Thêm sự kiện click trên overlay
            >
                <motion.div
                    ref={modalRef} // Tham chiếu đến nội dung popup
                    className="relative bg-white max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl p-12"
                >
                    {/* Nút đóng nằm tách biệt, không ảnh hưởng đến padding của nội dung */}
                    <button
                        onClick={handleCloseModal}
                        className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white text-1xl font-semibold z-10 transition-all duration-200 cursor-pointer rounded-full w-9 h-9 flex items-center justify-center"
                    >
                        ✕
                    </button>
                    {/* Nội dung có padding đều (được bao bởi p-6 từ thẻ cha) */}
                    <ExamResultSummary
                        historyId={selectedHistoryId}
                        viewMode={true}
                        onExit={handleCloseModal}
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default DetailHistory;