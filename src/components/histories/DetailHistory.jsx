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
            {selectedHistoryId && ( // Chỉ render khi có selectedHistoryId
                <motion.div
                    key="modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }} // Tối ưu thời gian animation
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={handleOverlayClick}
                >
                    <motion.div
                        ref={modalRef}
                        className="relative bg-white max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl p-12"
                        initial={{ scale: 0.9 }} // Thêm hiệu ứng scale ban đầu
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.9 }}
                    >
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white text-1xl font-semibold z-10 transition-all duration-200 cursor-pointer rounded-full w-9 h-9 flex items-center justify-center"
                        >
                            ✕
                        </button>
                        <ExamResultSummary
                            historyId={selectedHistoryId}
                            viewMode={true}
                            onExit={handleCloseModal}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default DetailHistory;