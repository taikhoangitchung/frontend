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
    const [isStarted, setIsStarted] = useState(false);
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

        const handleMessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("📩 WS received:", data);

                if (data.type === "START") {
                    setIsStarted(true);
                    setReady(true);
                }

                if (data.type === "END") {
                    console.log("📥 Nhận được END từ server 🎉");
                    setWaitingForOthers(false);
                }
            } catch (e) {
                console.error("❌ WS parse error:", e);
            }
        };

        const handleJoin = () => {
            if (code && username) {
                console.log("📤 Gửi lại JOIN từ play exam form");
                socket.send(`JOIN:${code}:${username}`);
            }
        };

        if (socket.readyState === WebSocket.OPEN) {
            handleJoin();
            socket.addEventListener("message", handleMessage);
        } else {
            socket.addEventListener("open", () => {
                handleJoin();
                socket.addEventListener("message", handleMessage);
            });
        }

        return () => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.removeEventListener("message", handleMessage);
                socketRef.current.close();
                console.log("❌ WS đóng tại play form");
            }
        };
    }, [code, username]);

    useEffect(() => {
        if (ready && isStarted && !submitted) {
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
    }, [ready, isStarted]);

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
            console.log(response.data)
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

    const getTimerColor = () => {
        const percent = (timeLeft / (duration * 60)) * 100;
        if (percent <= 25) return "text-red-500";
        if (percent <= 50) return "text-yellow-500";
        return "text-white";
    };

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

            <div className="flex justify-between">
                <div className="bg-black/30 px-4 py-2 rounded-full font-semibold">
                    ⏰ <span className={getTimerColor()}>{formatTime(timeLeft)}</span>
                </div>
                <Button
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold"
                    disabled={submitting || submitted}
                    onClick={() => handleSubmitQuiz(false)}
                >
                    {submitting ? "Đang nộp bài..." : "Nộp bài"}
                </Button>
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
                    onClick={() => setQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={questionIndex === 0 || submitted}
                >
                    Câu trước
                </Button>
                <Button
                    onClick={() => setQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    disabled={questionIndex === questions.length - 1 || submitted}
                >
                    Câu tiếp theo
                </Button>
            </div>
        </div>
    );
}
