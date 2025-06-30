"use client"

import { useEffect, useState } from "react"
import { Download, Plus, Trash2, GripVertical, Eye, EyeOff, Upload, Save, RefreshCw } from "lucide-react"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"

export default function ImprovedExcelTemplate() {
    const [questions, setQuestions] = useState([
        {
            id: "1",
            content: "Ưu điểm của Java là gì ?",
            category: "Công nghệ",
            difficulty: "Dễ",
            type: "single",
            answer1: "Tính đa nền tảng",
            answer2: "Hướng đối tượng rõ ràng",
            answer3: "Bảo mật và quản lý bộ nhớ tốt",
            answer4: "Dễ học",
            correct: "1,2,3",
        },
        {
            id: "2",
            content: "2 + 2 = ?",
            category: "Khoa học",
            difficulty: "Dễ",
            type: "single",
            answer1: "3",
            answer2: "4",
            answer3: "5",
            answer4: "",
            correct: "2",
        },
        {
            id: "3",
            content: "Trái đất quay quanh mặt trời",
            category: "Khoa học",
            difficulty: "Dễ",
            type: "boolean",
            answer1: "Đúng",
            answer2: "Sai",
            answer3: "",
            answer4: "",
            correct: "1",
        },
    ])

    const [categories] = useState(["Công nghệ", "Khoa học", "Toán học", "Văn học", "Lịch sử"])
    const [difficulties] = useState(["Dễ", "Trung bình", "Khó"])
    const [types] = useState([
        { value: "single", label: "Một lựa chọn" },
        { value: "multiple", label: "Nhiều lựa chọn" },
        { value: "boolean", label: "Đúng/Sai" }
    ])

    const [previewMode, setPreviewMode] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [draggedItem, setDraggedItem] = useState(null)

    const getTypeLabel = (value) => {
        return types.find(t => t.value === value)?.label || value
    }

    const downloadExcel = async () => {
        setIsGenerating(true)

        const workbook = new ExcelJS.Workbook()
        const sheet = workbook.addWorksheet("Câu hỏi")

        // Tiêu đề
        sheet.addRow([
            "STT",
            "Nội dung",
            "Danh mục",
            "Độ khó",
            "Loại",
            "Đáp án A",
            "Đáp án B",
            "Đáp án C",
            "Đáp án D",
            "Đáp án đúng"
        ])

        // Dữ liệu
        questions.forEach((q, index) => {
            sheet.addRow([
                index + 1,
                q.content,
                q.category,
                q.difficulty,
                getTypeLabel(q.type),
                q.answer1,
                q.answer2,
                q.answer3,
                q.answer4,
                q.correct
            ])
        })

        const buffer = await workbook.xlsx.writeBuffer()
        const now = new Date()
        const timestamp = now.toISOString().slice(0, 19).replace(/:/g, "-")
        saveAs(new Blob([buffer]), `cau-hoi-quizizz-${timestamp}.xlsx`)
        setIsGenerating(false)
        alert(`File cau-hoi-quizizz-${timestamp}.xlsx đã được tạo thành công!`)
    }

    const updateQuestion = (id, field, value) => {
        setQuestions(questions.map((q) => {
            if (q.id === id) {
                const updated = { ...q, [field]: value }
                if (field === 'type' && value === 'boolean') {
                    updated.answer3 = ""
                    updated.answer4 = ""
                }
                return updated
            }
            return q
        }))
    }

    const handleDragStart = (e, index) => {
        setDraggedItem(index)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e, dropIndex) => {
        e.preventDefault()
        if (draggedItem === null) return
        const newQuestions = [...questions]
        const draggedQuestion = newQuestions[draggedItem]
        newQuestions.splice(draggedItem, 1)
        newQuestions.splice(dropIndex, 0, draggedQuestion)
        setQuestions(newQuestions)
        setDraggedItem(null)
    }

    const validateQuestion = (question) => {
        const errors = []
        if (!question.content.trim()) errors.push('Thiếu nội dung câu hỏi')
        if (!question.answer1.trim()) errors.push('Thiếu đáp án 1')
        if (!question.answer2.trim()) errors.push('Thiếu đáp án 2')
        if (question.type !== 'boolean' && !question.answer3.trim()) errors.push('Thiếu đáp án 3')
        if (!question.correct.trim()) errors.push('Thiếu đáp án đúng')
        return errors
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">📊</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">Excel Template Generator</h1>
                                <p className="text-sm text-slate-500">Tạo file Excel cho câu hỏi trắc nghiệm</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-lg">
                                {questions.length} câu hỏi
                            </div>

                            <button
                                onClick={() => setPreviewMode(!previewMode)}
                                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                <span>{previewMode ? 'Chỉnh sửa' : 'Xem trước'}</span>
                            </button>

                            <button
                                onClick={downloadExcel}
                                disabled={isGenerating}
                                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                <span>{isGenerating ? 'Đang tạo...' : 'Tải xuống Excel'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {!previewMode && (
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800">Danh sách câu hỏi</h2>
                            <p className="text-slate-600 text-sm mt-1"> Câu hỏi của bạn</p>
                        </div>

                        {/*<button*/}
                        {/*    onClick={addQuestion}*/}
                        {/*    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg transition-colors shadow-md hover:shadow-lg"*/}
                        {/*>*/}
                        {/*    <Plus className="w-4 h-4" />*/}
                        {/*    <span>Thêm câu hỏi</span>*/}
                        {/*</button>*/}
                    </div>
                )}

                {/* Questions List */}
                <div className="space-y-4">
                    {questions.map((question, index) => (
                        <div
                            key={question.id}
                            className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-md ${
                                draggedItem === index ? 'opacity-50 scale-95' : ''
                            }`}
                            draggable={!previewMode}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                        >
                            {/* Question Header */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
                                <div className="flex items-center space-x-3">
                                    {!previewMode && (
                                        <div className="cursor-move text-slate-400 hover:text-slate-600">
                                            <GripVertical className="w-5 h-5" />
                                        </div>
                                    )}
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-800">Câu hỏi {index + 1}</h3>
                                        {previewMode && (
                                            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                    {question.category}
                                                </span>
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                                    {question.difficulty}
                                                </span>
                                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                                    {getTypeLabel(question.type)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {!previewMode && (
                                    <div className="flex items-center space-x-2">
                                        {validateQuestion(question).length > 0 && (
                                            <div className="w-3 h-3 bg-red-500 rounded-full" title="Câu hỏi chưa hoàn thiện"></div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Question Content */}
                            <div className="p-6">
                                {previewMode ? (
                                    <div className="space-y-4">
                                        <div className="text-lg font-medium text-slate-800">
                                            {question.content || "Chưa có nội dung câu hỏi"}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[question.answer1, question.answer2, question.answer3, question.answer4]
                                                .filter(answer => answer.trim())
                                                .map((answer, i) => (
                                                    <div
                                                        key={i}
                                                        className={`p-3 rounded-lg border-2 transition-colors ${
                                                            question.correct.includes((i + 1).toString())
                                                                ? 'border-green-300 bg-green-50 text-green-800'
                                                                : 'border-slate-200 bg-slate-50'
                                                        }`}
                                                    >
                                                    <span className="font-medium mr-2">
                                                        {String.fromCharCode(65 + i)}.
                                                    </span>
                                                        {answer}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Content Column */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Nội dung câu hỏi *
                                                </label>
                                                <textarea
                                                    value={question.content}
                                                    onChange={(e) => updateQuestion(question.id, "content", e.target.value)}
                                                    placeholder="Nhập nội dung câu hỏi..."
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                                    rows="3"
                                                />
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Danh mục
                                                    </label>
                                                    <select
                                                        value={question.category}
                                                        onChange={(e) => updateQuestion(question.id, "category", e.target.value)}
                                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    >
                                                        {categories.map((cat) => (
                                                            <option key={cat} value={cat}>{cat}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Độ khó
                                                    </label>
                                                    <select
                                                        value={question.difficulty}
                                                        onChange={(e) => updateQuestion(question.id, "difficulty", e.target.value)}
                                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    >
                                                        {difficulties.map((diff) => (
                                                            <option key={diff} value={diff}>{diff}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Loại câu hỏi
                                                    </label>
                                                    <select
                                                        value={question.type}
                                                        onChange={(e) => updateQuestion(question.id, "type", e.target.value)}
                                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    >
                                                        {types.map((type) => (
                                                            <option key={type.value} value={type.value}>{type.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Answers Column */}
                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-slate-700">
                                                Đáp án
                                            </label>

                                            {[1, 2, 3, 4].map((num) => (
                                                <div key={num}>
                                                    <input
                                                        type="text"
                                                        value={question[`answer${num}`]}
                                                        onChange={(e) => updateQuestion(question.id, `answer${num}`, e.target.value)}
                                                        placeholder={`Đáp án ${String.fromCharCode(64 + num)}`}
                                                        disabled={question.type === 'boolean' && num > 2}
                                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-slate-100 disabled:text-slate-500"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Correct Answer Column */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Đáp án đúng *
                                            </label>
                                            <input
                                                type="text"
                                                value={question.correct}
                                                onChange={(e) => updateQuestion(question.id, "correct", e.target.value)}
                                                placeholder={question.type === 'multiple' ? "1,2,3" : "1"}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">
                                                {question.type === 'multiple'
                                                    ? 'Nhiều đáp án: 1,2,3'
                                                    : 'Một đáp án: 1, 2, 3 hoặc 4'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Guide Section */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                        <span className="mr-2">💡</span>
                        Hướng dẫn sử dụng
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <h4 className="font-semibold text-blue-800 mb-2">Loại câu hỏi:</h4>
                            <ul className="space-y-1 text-blue-700">
                                <li>• <strong>Một lựa chọn:</strong> Chỉ có 1 đáp án đúng</li>
                                <li>• <strong>Nhiều lựa chọn:</strong> Có thể có nhiều đáp án đúng</li>
                                <li>• <strong>Đúng/Sai:</strong> Chỉ có 2 lựa chọn</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-blue-800 mb-2">Đáp án đúng:</h4>
                            <ul className="space-y-1 text-blue-700">
                                <li>• <strong>Một lựa chọn:</strong> Nhập số thứ tự (1, 2, 3, 4)</li>
                                <li>• <strong>Nhiều lựa chọn:</strong> Nhập các số cách nhau bằng dấu phẩy (1,2,3)</li>
                                <li>• <strong>Đúng/Sai:</strong> Nhập 1 (Đúng) hoặc 2 (Sai)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}