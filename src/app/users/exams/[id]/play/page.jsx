"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import ExamService from "../../../../../services/ExamService";
import ExamResultSummary from "../../../../../components/exam/ExamResultSummary";
import ConfirmDialog from "../../../../../components/alerts-confirms/ConfirmDialog";
import formatTime from "../../../../../util/formatTime";
import { Button } from "../../../../../components/ui/button";
import HistoryService from "../../../../../services/HistoryService";
import { X } from "lucide-react" // Thêm icon X

export default function OfflineExamForm() {
    const { id } = useParams()
    const router = useRouter()
    const [questions, setQuestions] = useState([])
    const [questionIndex, setQuestionIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [isTimeUp, setIsTimeUp] = useState(false)
    const [duration, setDuration] = useState(0)
    const [timeLeft, setTimeLeft] = useState(0)
    const [timeSpent, setTimeSpent] = useState(0)
    const [resultData, setResultData] = useState(null)
    const [userAnswers, setUserAnswers] = useState({})
    const timerRef = useRef(null)

    const currentQuestion = questions[questionIndex] || {}
    const isMultipleChoice = currentQuestion?.type?.name === "multiple"

    useEffect(() => {
        const fetchQuizData = async () => {
            setLoading(true)
            try {
                const response = await ExamService.getToPlayById(id)
                setQuestions(response.data.questions)
                setDuration(response.data.duration)
                setTimeLeft(response.data.duration * 60)
            } catch (error) {
                toast.error("Lỗi tải bài thi!")
            } finally {
                setLoading(false)
            }
        }
        fetchQuizData()
    }, [id])

    useEffect(() => {
        if (!loading && !submitted) {
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
        }
        return () => clearInterval(timerRef.current)
    }, [loading, submitted])

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
            updatedAnswerIds.includes(answerId)
                ? updatedAnswerIds = updatedAnswerIds.filter((id) => id !== answerId)
                : updatedAnswerIds.push(answerId)
        } else {
            updatedAnswerIds = [answerId]
        }
        setUserAnswers((prev) => ({ ...prev, [questionIndex]: updatedAnswerIds }))
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
        setTimeLeft(duration * 60)
        if (timerRef.current) clearInterval(timerRef.current)
    }

    const handleSubmitQuiz = async (isAutoSubmit = false) => {
        if (submitted || submitting) return
        const hasAnyAnswer = Object.values(userAnswers).some((arr) => arr && arr.length > 0);
        if (!isAutoSubmit && !hasAnyAnswer) {
            toast.error("Bạn cần trả lời ít nhất 1 câu hỏi!");
            return;
        }
        clearInterval(timerRef.current)
        setSubmitting(true)

        try {
            const submissionData = {
                examId: id,
                timeTaken: timeSpent,
                finishedAt: new Date().toISOString().replace("Z", "").split(".")[0],
                choices: questions.map((q, i) => ({
                    questionId: q.id,
                    answerIds: userAnswers[i] || [],
                })),
            }
            const response = await HistoryService.add(submissionData)
            setSubmitted(true)
            setResultData(response.data)
            toast.success(isAutoSubmit ? "Tự động nộp bài!" : "Nộp bài thành công!")
        } catch (error) {
            toast.error("Lỗi khi nộp bài!")
            setSubmitting(false)
            if (isAutoSubmit) setIsTimeUp(false)
        }
    }

    const getCompletionPercentage = () => {
        const count = Object.values(userAnswers).filter((a) => a.length > 0).length
        return Math.round((count / questions.length) * 100)
    }

    const getAnswerButtonStyle = (answer) => {
        const base = `relative w-full h-full min-h-[14rem] md:min-h-[20rem] rounded-2xl flex items-center justify-center text-white font-semibold text-base sm:text-lg md:text-xl transition-all duration-300 cursor-pointer`
        const selected = userAnswers[questionIndex]?.includes(answer.id)
        const disabled = submitted || submitting
        const state = disabled ? "opacity-50 cursor-not-allowed" : ""
        return selected
            ? `${base} ${state} bg-gradient-to-br ${answer.color} ring-4 ring-white scale-105 shadow-lg`
            : `${base} ${state} bg-gradient-to-br ${answer.color} ${!disabled ? "hover:scale-105 hover:shadow-lg" : ""}`
    }

    const getQuestionButtonStyle = (index) => {
        const isCurrent = questionIndex === index
        const hasAnswer = userAnswers[index]?.length > 0
        if (isCurrent) return "bg-white text-purple-900 shadow-lg"
        if (hasAnswer) return "bg-green-400 text-white hover:bg-green-400"
        return "bg-purple-700/50 text-white"
    }

    const getTimerColor = () => {
        const percent = (timeLeft / (duration * 60)) * 100
        if (percent <= 25) return "text-red-500"
        if (percent <= 50) return "text-yellow-500"
        return "text-white"
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white">Đang tải...</div>
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white p-6 flex flex-col gap-6 relative">
            {submitted && resultData && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <ExamResultSummary historyId={resultData} onReplay={handleReplay} isOnline={false} />
                </div>
            )}
            <div className="flex items-center justify-between">
                <ConfirmDialog
                    triggerLabel={
                        <div className="flex items-center gap-2">
                            <X size={18} /> {/* Thêm icon X */}
                            Thoát ra
                        </div>
                    }
                    triggerClass="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2"
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
                        {submitting ? "Đang nộp..." : "Nộp bài"}
                    </Button>
                </div>
            </div>

            <div className="text-center text-xl bg-black/20 rounded-2xl p-6">
                {currentQuestion?.content}
                <div className="text-lg text-purple-200 font-normal">
                    ({isMultipleChoice ? "Chọn nhiều đáp án" : "Chọn một đáp án"})
                </div>
            </div>

            <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))` }}>
                {currentQuestion?.answers?.map((answer, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={getAnswerButtonStyle(answer)}
                        disabled={submitting || submitted}
                    >
                        <span className="text-center px-4">{answer.content}</span>

                        {userAnswers[questionIndex]?.includes(answer.id) && (
                            <div className="absolute top-3 left-3">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-900" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </button>
                ))}
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
        </div>
    )
}