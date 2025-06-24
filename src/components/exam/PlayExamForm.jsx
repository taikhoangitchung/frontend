"use client"

import {useState, useEffect, useRef} from "react"
import {Button} from "../ui/button"
import ExamService from "../../services/ExamService"
import {useParams, usePathname, useRouter} from "next/navigation"
import {toast} from "sonner"
import HistoryService from "../../services/HistoryService"
import ExamResultSummary from "./ExamResultSummary";
import ConfirmDialog from "../alerts-confirms/ConfirmDialog";
import formatTime from "../../util/formatTime";
import socketInstance from "../../config/socketConfig";

export default function PlayExamForm() {
    const {id, code} = useParams()
    const router = useRouter()
    const [questions, setQuestions] = useState([])
    const [questionIndex, setQuestionIndex] = useState(0)
    const [waitingForOthers, setWaitingForOthers] = useState(false);
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [isTimeUp, setIsTimeUp] = useState(false)
    const [duration, setDuration] = useState(0)
    const [timeLeft, setTimeLeft] = useState(0)
    const [timeSpent, setTimeSpent] = useState(0)
    const [resultData, setResultData] = useState(null)
    const [countdown, setCountdown] = useState(3)
    const [ready, setReady] = useState(false)
    const [userAnswers, setUserAnswers] = useState({})
    const [isStarted, setIsStarted] = useState(false);

    const isOnline = usePathname().includes("/online/")
    const timerRef = useRef(null)
    const socketRef = useRef(null);
    const currentQuestion = questions[questionIndex] || {}
    const isMultipleChoice = currentQuestion?.type?.name === "multiple"
    const username = localStorage.getItem("username");

    useEffect(() => {
        const fetchQuizData = async () => {
            setLoading(true)
            try {
                let response
                if (id) {
                    response = await ExamService.getToPlayById(id)
                } else if (code) {
                    response = await ExamService.getToPlayByRoomCode(code)
                }
                setQuestions(response.data.questions)
                setDuration(response.data.duration)
                setTimeLeft(response.data.duration * 60)
                setCountdown(3)
                setReady(false)

                let counter = 3
                const interval = setInterval(() => {
                    counter -= 1
                    setCountdown(counter)
                    if (counter === 0) {
                        clearInterval(interval)
                        setTimeout(() => {
                            setReady(true)
                        }, 1000)
                    }
                }, 1000)
            } catch (error) {
                toast.error("Có lỗi xảy ra khi tải bài thi!")
            } finally {
                setLoading(false)
            }
        }
        fetchQuizData()
    }, [id])

    useEffect(() => {
        if (!isOnline || !code || !username) return;

        const socket = socketInstance();
        socketRef.current = socket;

        const handleMessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === "START") {
                    setIsStarted(true);
                    setReady(true); // bắt đầu đếm giờ
                }

                if (data.type === "END") {
                    setWaitingForOthers(false);
                    if (socketRef.current?.readyState === WebSocket.OPEN) {
                        socketRef.current.close();
                        console.log("✅ Đã đóng WebSocket sau END");
                    }
                }
            } catch (err) {
                console.error("❌ Lỗi xử lý WS message:", err);
            }
        };

        socket.addEventListener("open", () => {
            console.log("🟢 WebSocket mở, gửi START");
        });

        socket.addEventListener("message", handleMessage);
        socket.addEventListener("close", () => {
            console.log("🔌 WebSocket đã đóng");
        });

        return () => {
            socket.removeEventListener("message", handleMessage);
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                socket.close();
                console.log("🚪 Đã đóng WebSocket khi rời trang");
            }
        };
    }, [isOnline, code, username]);


    useEffect(() => {
        if (!loading && ready && isStarted && !submitted) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current)
                        setIsTimeUp(true)
                        return 0
                    }
                    return prev - 1
                })
                setTimeSpent((prev) => prev + 1)
            }, 1000)
            return () => clearInterval(timerRef.current)
        }
    }, [loading, ready, submitted])

    useEffect(() => {
        if (isTimeUp && !submitted && !submitting) {
            handleSubmitQuiz(true)
        }
    }, [isTimeUp, submitted, submitting])

    const handleAnswerSelect = (answerIndex) => {
        if (submitted || submitting) return
        const answerId = currentQuestion.answers[answerIndex].id
        let updatedAnswerIds = isMultipleChoice ? [...(userAnswers[questionIndex] || [])] : []
        if (isMultipleChoice) {
            if (updatedAnswerIds.includes(answerId)) {
                updatedAnswerIds = updatedAnswerIds.filter((id) => id !== answerId)
            } else {
                updatedAnswerIds.push(answerId)
            }
        } else {
            updatedAnswerIds = [answerId]
        }
        setUserAnswers((prev) => ({...prev, [questionIndex]: updatedAnswerIds}))
    }

    const changeQuestion = (index) => {
        if (submitted || submitting || index < 0 || index >= questions.length) return
        setQuestionIndex(index)
    }

    const handleReplay = () => {
        setSubmitted(false)
        setResultData(null)
        setUserAnswers({})
        setQuestionIndex(0)
        setTimeSpent(0)
        setIsTimeUp(false)
        setSubmitting(false)
        setReady(false)
        setIsStarted(false);
        setCountdown(3)

        if (timerRef.current) clearInterval(timerRef.current)

        setTimeLeft(duration * 60)

        let counter = 3
        const interval = setInterval(() => {
            counter -= 1
            setCountdown(counter)
            if (counter === 0) {
                clearInterval(interval)
                setTimeout(() => {
                    setReady(true)
                }, 1000)
            }
        }, 1000)
    }

    const handleSubmitQuiz = async (isAutoSubmit = false) => {
        if (submitted || submitting) return;
        clearInterval(timerRef.current);
        setSubmitting(true);

        try {
            const submissionData = {
                examId: id,
                timeTaken: timeSpent,
                finishedAt: new Date().toISOString().replace("Z", "").split(".")[0],
                choices: questions.map((q, i) => ({
                    questionId: q.id,
                    answerIds: userAnswers[i] || [],
                })),
                ...(code && {roomCode: code}),
            };

            const response = await HistoryService.add(submissionData);
            console.log(response)

            if (isOnline && socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(`SUBMIT:${code}`);
            }
            if (isOnline) {
                setWaitingForOthers(true);
            }
            setSubmitted(true);
            setResultData(response.data);

            toast.success(isAutoSubmit ? "Tự động nộp bài!" : "Nộp bài thành công!");
        } catch (error) {
            toast.error("Lỗi khi nộp bài!");
            setSubmitting(false);
            if (isAutoSubmit) setIsTimeUp(false);
        }
    };

    const getQuestionButtonStyle = (index) => {
        const isCurrent = questionIndex === index
        const hasAnswer = userAnswers[index]?.length > 0
        if (isCurrent) return "bg-white text-purple-900 shadow-lg"
        if (hasAnswer) return "bg-green-400 text-white hover:bg-green-400 border border-green-400"
        return "bg-purple-700/50 text-white hover:bg-purple-600/70 border border-purple-500/30"
    }

    const getAnswerButtonStyle = (answer) => {
        const base = `w-full h-full min-h-[14rem] md:min-h-[20rem] rounded-2xl flex items-center justify-center text-white font-semibold text-base sm:text-lg md:text-xl transition-all duration-300 cursor-pointer`
        const selected = userAnswers[questionIndex]?.includes(answer.id)
        const disabled = submitted || submitting
        const state = disabled ? "opacity-50 cursor-not-allowed" : ""
        if (selected) {
            return `${base} ${state} bg-gradient-to-br ${answer.color} ring-4 ring-white ring-opacity-60 scale-105 shadow-lg`
        } else {
            return `${base} ${state} bg-gradient-to-br ${answer.color} ${!disabled ? "hover:scale-105 hover:shadow-lg" : ""}`
        }
    }

    const getCompletionPercentage = () => {
        const count = Object.values(userAnswers).filter((a) => a.length > 0).length
        return Math.round((count / questions.length) * 100)
    }

    const getTimerColor = () => {
        const percent = (timeLeft / (duration * 60)) * 100
        if (percent <= 25) return "text-red-500"
        if (percent <= 50) return "text-yellow-500"
        return "text-white"
    }

    if (loading) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center relative">
                <div className="text-white text-xl">Đang tải...</div>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white p-6 flex flex-col gap-6 relative">
            {!ready && countdown > 0 && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center text-white text-7xl font-extrabold animate-pulse select-none">
                    {countdown}
                </div>
            )}

            {!ready && countdown === 0 && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center text-white text-5xl font-bold animate-pulse select-none">
                    BẮT ĐẦU!
                </div>
            )}

            {submitted && isOnline && waitingForOthers && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center text-white z-50">
                    <div className="text-3xl font-bold">Đang chờ các thí sinh khác hoàn thành...</div>
                </div>
            )}

            {submitted && resultData && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <ExamResultSummary
                        historyId={resultData}
                        onReplay={handleReplay}
                        isOnline={isOnline}
                    />
                </div>
            )}
            <>
                <div className="flex items-center justify-between">
                    <ConfirmDialog
                        triggerLabel="Thoát ra"
                        triggerClass="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold disabled:opacity-50"
                        disabled={submitting}
                        title="Bạn có chắc chắn muốn thoát?"
                        description="Bài làm sẽ không được lưu lại nếu chưa nộp."
                        actionLabel="Thoát ngay"
                        onConfirm={() => router.push("/users/dashboard")}
                    />
                    <div className="flex items-center gap-4">
                        <div className="bg-black/30 rounded-full px-4 py-2">
                            <span className={`font-semibold ${getTimerColor()}`}>⏰ {formatTime(timeLeft)}</span>
                        </div>
                        <div className="bg-black/30 rounded-full px-4 py-2">
                            <span className="font-semibold">Hoàn thành: {getCompletionPercentage()}%</span>
                        </div>
                        <Button
                            onClick={() => handleSubmitQuiz(false)}
                            disabled={submitting || submitted}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold disabled:opacity-50"
                        >
                            {submitting ? "Đang nộp bài..." : "Nộp bài"}
                        </Button>
                    </div>
                </div>

                <div className="text-center text-xl md:text-2xl bg-black/20 rounded-2xl p-6">
                    {currentQuestion?.content}
                    <div className="text-lg text-purple-200 font-normal">
                        ({isMultipleChoice ? "Chọn nhiều đáp án" : "Chọn một đáp án"})
                    </div>
                </div>

                <div className={`grid gap-4 w-full`}
                     style={{gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`}}>
                    {currentQuestion?.answers?.map((answer, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            className={getAnswerButtonStyle(answer)}
                            disabled={submitted || submitting}
                        >
                            <span className="text-center px-4">{answer.content}</span>
                            {userAnswers[questionIndex]?.includes(answer.id) && (
                                <div className="absolute top-3 left-3">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-purple-900" fill="currentColor"
                                             viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                  clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex justify-center gap-4">
                    <Button
                        onClick={() => changeQuestion(questionIndex - 1)}
                        disabled={questionIndex === 0 || submitting || submitted}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-semibold disabled:opacity-50"
                    >
                        Câu trước
                    </Button>
                    <Button
                        onClick={() => changeQuestion(questionIndex + 1)}
                        disabled={questionIndex >= questions.length - 1 || submitting || submitted}
                        className="bg-white text-purple-900 hover:bg-gray-100 px-6 py-3 rounded-full font-semibold disabled:opacity-50"
                    >
                        Câu tiếp theo
                    </Button>
                </div>
                <div
                    className="bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-purple-600/30 w-fit mx-auto">
                    <div className="text-sm font-medium text-center mb-3 text-purple-200">Câu hỏi</div>

                    <div className="flex justify-center">
                        <div className="grid grid-cols-10 gap-1 overflow-y-auto max-h-[300px] p-1">
                            {questions.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => changeQuestion(index)}
                                    className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 ${getQuestionButtonStyle(index)} ${submitting || submitted ? "opacity-50 cursor-not-allowed" : ""}`}
                                    disabled={submitting || submitted}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>

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
            </>
            )
        </div>
    )
}