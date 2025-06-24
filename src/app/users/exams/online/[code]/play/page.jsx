"use client"

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import ExamService from "../../../../../../services/ExamService";
import socketInstance from "../../../../../../config/socketConfig";
import ExamResultSummary from "../../../../../../components/exam/ExamResultSummary";
import formatTime from "../../../../../../util/formatTime";
import {Button} from "../../../../../../components/ui/button";
import HistoryService from "../../../../../../services/HistoryService";
import ConfirmDialog from "../../../../../../components/alerts-confirms/ConfirmDialog";

export default function PlayExamFormOnline() {
    const { code } = useParams();
    const router = useRouter();

    const [questions, setQuestions] = useState([]);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);
    const [duration, setDuration] = useState(0);
    const [countdown, setCountdown] = useState(3);
    const [ready, setReady] = useState(false);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [waitingForOthers, setWaitingForOthers] = useState(false);
    const [resultData, setResultData] = useState(null);
    const [historyId, setHistoryId] = useState(null);

    const socketRef = useRef(null);
    const timerRef = useRef(null);
    const username = localStorage.getItem("username");

    const fetchLatestResult = async () => {
        try {
            const res = await HistoryService.getHistoryDetail(historyId);
            console.log(res);
            setResultData(res.data);
        } catch (err) {
            toast.error("Không thể tải kết quả bài thi.");
        }
    };
    useEffect(() => {
        if (historyId && !resultData) {
            fetchLatestResult();
        }
    }, [historyId]);


    const currentQuestion = questions[questionIndex] || {};
    const isMultipleChoice = currentQuestion?.type?.name === "multiple";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await ExamService.getToPlayByRoomCode(code);
                setQuestions(res.data.questions);
                setDuration(res.data.duration);
                setTimeLeft(res.data.duration * 60);

                let counter = 3;
                const interval = setInterval(() => {
                    counter -= 1;
                    setCountdown(counter);
                    if (counter === 0) {
                        clearInterval(interval);
                        setTimeout(() => setReady(true), 1000);
                    }
                }, 1000);
            } catch (err) {
                toast.error("Không thể tải bài thi");
                router.push("/users/dashboard");
            }
        };
        fetchData();
    }, [code]);

    useEffect(() => {
        const socket = socketInstance();
        socketRef.current = socket;

        const trySendJoin = () => {
            if (code && username) {
                console.log("📤 Gửi lại JOIN từ play exam form");
                socket.send(`JOIN:${code}:${username}`);
            }
        };

        const handleMessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("📩 WS received:", data);

                if (data.type === "END") {
                    console.log("📥 Nhận được END từ server 🎉");
                    setWaitingForOthers(false);
                }
            } catch (e) {
                console.error("❌ WS parse error:", e);
            }
        };

        socket.addEventListener("open", trySendJoin);
        socket.addEventListener("message", handleMessage);

        return () => {
            socket.removeEventListener("open", trySendJoin);
            socket.removeEventListener("message", handleMessage);
            socket.close();
            console.log("❌ WS đóng tại play form");
        };
    }, [code, username]);

    useEffect(() => {
        if (ready && !submitted) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setIsTimeUp(true);
                        return 0;
                    }
                    return prev - 1;
                });
                setTimeSpent((prev) => prev + 1);
            }, 1000);

            return () => clearInterval(timerRef.current);
        }
    }, [ready]);

    useEffect(() => {
        if (isTimeUp && !submitted && !submitting) {
            handleSubmitQuiz(true);
        }
    }, [isTimeUp]);

    const handleAnswerSelect = (answerIndex) => {
        if (submitted || submitting) return;

        const answerId = currentQuestion.answers[answerIndex].id;
        let updated = isMultipleChoice ? [...(userAnswers[questionIndex] || [])] : [];

        if (isMultipleChoice) {
            if (updated.includes(answerId)) {
                updated = updated.filter((id) => id !== answerId);
            } else {
                updated.push(answerId);
            }
        } else {
            updated = [answerId];
        }

        setUserAnswers((prev) => ({ ...prev, [questionIndex]: updated }));
    };

    const handleSubmitQuiz = async (isAutoSubmit = false) => {
        if (submitted || submitting) return;

        const hasAnyAnswer = Object.values(userAnswers).some((a) => a.length > 0);
        if (!isAutoSubmit && !hasAnyAnswer) {
            toast.error("Bạn cần chọn ít nhất một đáp án trước khi nộp!");
            return;
        }

        clearInterval(timerRef.current);
        setSubmitting(true);

        try {
            const submissionData = {
                roomCode: code,
                timeTaken: timeSpent,
                finishedAt: new Date().toISOString().replace("Z", "").split(".")[0],
                choices: questions.map((q, i) => ({
                    questionId: q.id,
                    answerIds: userAnswers[i] || [],
                })),
            };

            const response = await HistoryService.add(submissionData);
            setSubmitted(true);
            setHistoryId(response.data)

            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(`SUBMIT:${code}`);
            }

            setWaitingForOthers(true);
            toast.success(isAutoSubmit ? "Tự động nộp bài!" : "Đã nộp bài!");
        } catch (err) {
            toast.error("Lỗi khi nộp bài!");
            setSubmitting(false);
        }
    };

    const getAnswerButtonStyle = (answer) => {
        const base = `relative w-full h-full min-h-[14rem] md:min-h-[20rem] rounded-2xl flex items-center justify-center text-white font-semibold text-base sm:text-lg md:text-xl transition-all duration-300 cursor-pointer`;
        const selected = userAnswers[questionIndex]?.includes(answer.id);
        const disabled = submitted || submitting;

        if (selected) {
            return `${base} ${disabled ? "opacity-50" : ""} bg-gradient-to-br ${answer.color} ring-4 ring-white ring-opacity-60 scale-105 shadow-lg`;
        } else {
            return `${base} ${disabled ? "opacity-50" : ""} bg-gradient-to-br ${answer.color} hover:scale-105 hover:shadow-lg`;
        }
    };

    const getCompletionPercentage = () => {
        const count = Object.values(userAnswers).filter((a) => a.length > 0).length
        return Math.round((count / questions.length) * 100)
    }

    const getTimerColor = () => {
        const percent = (timeLeft / (duration * 60)) * 100;
        if (percent <= 25) return "text-red-500";
        if (percent <= 50) return "text-yellow-500";
        return "text-white";
    };

    const changeQuestion = (index) => {
        if (submitted || submitting || index < 0 || index >= questions.length) return
        setQuestionIndex(index)
    }
    const getQuestionButtonStyle = (index) => {
        const isCurrent = questionIndex === index
        const hasAnswer = userAnswers[index]?.length > 0
        if (isCurrent) return "bg-white text-purple-900 shadow-lg"
        if (hasAnswer) return "bg-green-400 text-white hover:bg-green-400"
        return "bg-purple-700/50 text-white"
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white p-6 flex flex-col gap-6">
            {!ready && countdown > 0 && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center text-white text-7xl font-extrabold animate-pulse select-none">
                    {countdown}
                </div>
            )}
            {!ready && countdown === 0 && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center text-white text-5xl font-bold animate-pulse select-none">
                    BẮT ĐẦU!
                </div>
            )}

            {submitted && waitingForOthers && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                    <div className="text-3xl font-bold">Đang chờ các thí sinh khác hoàn thành...</div>
                </div>
            )}

            {!waitingForOthers && historyId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <ExamResultSummary historyId={historyId} isOnline={true} />
                </div>
            )}

            <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Nút Thoát ra luôn nằm bên trái */}
                <ConfirmDialog
                    triggerLabel="Thoát ra"
                    triggerClass="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold"
                    title="Bạn có chắc chắn muốn thoát?"
                    description="Bài làm sẽ không được lưu lại nếu chưa nộp."
                    actionLabel="Thoát ngay"
                    onConfirm={() => router.push("/users/dashboard")}
                />

                {/* Cụm Timer + Hoàn thành + Nút nộp bài sát nhau bên phải */}
                <div className="flex items-center gap-3 ml-auto">
                    <div className="bg-black/30 px-4 py-2 rounded-full font-semibold">
                        ⏰ <span className={getTimerColor()}>{formatTime(timeLeft)}</span>
                    </div>
                    <div className="bg-black/30 rounded-full px-4 py-2">
                        <span className="font-semibold">Hoàn thành: {getCompletionPercentage()}%</span>
                    </div>
                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold"
                        disabled={submitting || submitted}
                        onClick={() => handleSubmitQuiz(false)}
                    >
                        {submitting ? "Đã nộp bài..." : "Nộp bài"}
                    </Button>
                </div>
            </div>


            <div className="text-center text-xl md:text-2xl bg-black/20 rounded-2xl p-6">
                {currentQuestion?.content}
                <div className="text-lg text-purple-200 font-normal">
                    ({isMultipleChoice ? "Chọn nhiều đáp án" : "Chọn một đáp án"})
                </div>
            </div>

            <div className="grid gap-4 w-full" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))` }}>
                {currentQuestion?.answers?.map((answer, index) => (
                    <button
                        key={index}
                        className={getAnswerButtonStyle(answer)}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={submitted || submitting}
                    >
                        <span className="text-center px-4">{answer.content}</span>
                        {userAnswers[questionIndex]?.includes(answer.id) && (
                            <div className="absolute top-3 left-3">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-900" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex justify-center gap-4 mt-4">
                <Button
                    onClick={() => changeQuestion(questionIndex - 1)}
                    disabled={questionIndex === 0 || submitting || submitted}
                    className="bg-white text-purple-900 hover:bg-gray-200 font-semibold px-6 py-2 rounded-full disabled:opacity-50"
                >
                    Câu trước
                </Button>
                <Button
                    onClick={() => changeQuestion(questionIndex + 1)}
                    disabled={questionIndex >= questions.length - 1 || submitting || submitted}
                    className="bg-white text-purple-900 hover:bg-gray-200 font-semibold px-6 py-2 rounded-full disabled:opacity-50"
                >
                    Câu tiếp theo
                </Button>
            </div>
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 w-fit mx-auto border border-purple-600/30">
                    <div className="text-sm font-medium text-center mb-3 text-purple-200">Bản đồ câu hỏi</div>
                    <div className="grid grid-cols-10 gap-1 overflow-y-auto max-h-[300px] p-1">
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => changeQuestion(index)}
                                className={`w-10 h-10 rounded-lg font-semibold text-sm ${getQuestionButtonStyle(index)}`}
                                disabled={submitting || submitted}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    {/* 👇 Chú thích màu sắc */}
                    <div className="mt-4 flex justify-center gap-6 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-white rounded"></div>
                            <span className="text-purple-200">Hiện tại</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-400 rounded"></div>
                            <span className="text-purple-200">Đã trả lời</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-700 rounded"></div>
                            <span className="text-purple-200">Chưa làm</span>
                        </div>
                    </div>
                </div>
        </div>
    );
}
