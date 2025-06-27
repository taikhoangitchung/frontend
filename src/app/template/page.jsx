"use client"

import { useEffect, useState } from "react"
import { Copy, Check, Download, Loader2, Info } from "lucide-react"
import CategoryService from "../../services/CategoryService"
import DifficultyService from "../../services/DifficultyService"
import TypeService from "../../services/TypeService"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Alert, AlertDescription } from "../../components/ui/alert"
import * as XLSX from "xlsx"

export default function QuizInterface() {
    const [copiedRow, setCopiedRow] = useState(null)
    const [categories, setCategories] = useState([])
    const [difficulties, setDifficulties] = useState([])
    const [types, setTypes] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const resCategory = await CategoryService.getAll()
            setCategories(resCategory.data)

            const resDifficulty = await DifficultyService.getAll()
            setDifficulties(resDifficulty.data)

            const resType = await TypeService.getAll()
            setTypes(resType.data)
        } catch (error) {
            const message = error?.response?.data || "Đã xảy ra lỗi"
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const sampleQuestions = [
        {
            id: 1,
            content: "Những ngôn ngữ lập trình nào sau đây?",
            category: "Danh mục",
            difficulty: "Độ khó",
            type: "multi-choice",
            answers: [
                { answer: "Java", correct: true },
                { answer: "Python", correct: true },
                { answer: "Coffee", correct: false },
                { answer: "JavaScript", correct: true },
            ],
        },
        {
            id: 2,
            content: "Thủ đô của Pháp là gì?",
            category: "Danh mục",
            difficulty: "Độ khó",
            type: "single-choice",
            answers: [
                { answer: "Paris", correct: true },
                { answer: "Berlin", correct: false },
                { answer: "Madrid", correct: false },
            ],
        },
        {
            id: 3,
            content: "Trái đất có hình phẳng",
            category: "Danh mục",
            difficulty: "Độ khó",
            type: "true-false",
            answers: [
                { answer: "Đúng", correct: false },
                { answer: "Sai", correct: true },
            ],
        },
    ]

    const handleCopyRow = async (rowType, data) => {
        const textToCopy = data.map((item) => item.name).join(", ")
        try {
            await navigator.clipboard.writeText(textToCopy)
            const rowIndex = rowType === "categories" ? 0 : rowType === "types" ? 1 : 2
            setCopiedRow(rowIndex)
            toast.success(
                `Danh sách ${rowType === "categories" ? "danh mục" : rowType === "types" ? "kiểu câu hỏi" : "độ khó"} đã được sao chép`,
            )
            setTimeout(() => setCopiedRow(null), 2000)
        } catch (err) {
            toast.error("Không thể sao chép vào clipboard")
        }
    }

    const handleDownloadTemplate = () => {
        try {
            const workbook = XLSX.utils.book_new()

            const headers = ["ID", "Nội dung", "Danh mục", "Độ khó", "Kiểu câu hỏi", "Đáp án", "Đúng/Sai"]
            const templateData = [
                headers,
                ...flattenedData.map((row) => [
                    row.id,
                    row.content,
                    row.category,
                    row.difficulty,
                    row.type,
                    row.answer,
                    row.correct,
                ]),
            ]

            const templateSheet = XLSX.utils.aoa_to_sheet(templateData)

            templateSheet["!cols"] = [
                { wch: 5 },
                { wch: 50 },
                { wch: 15 },
                { wch: 15 },
                { wch: 15 },
                { wch: 30 },
                { wch: 10 },
            ]

            XLSX.utils.book_append_sheet(workbook, templateSheet, "Mẫu câu hỏi")

            const categoriesData = [["Danh mục có sẵn"], ...categories.map((cat) => [cat.name])]
            const categoriesSheet = XLSX.utils.aoa_to_sheet(categoriesData)
            categoriesSheet["!cols"] = [{ wch: 20 }]
            XLSX.utils.book_append_sheet(workbook, categoriesSheet, "Danh mục")

            const difficultiesData = [["Độ khó có sẵn"], ...difficulties.map((diff) => [diff.name])]
            const difficultiesSheet = XLSX.utils.aoa_to_sheet(difficultiesData)
            difficultiesSheet["!cols"] = [{ wch: 20 }]
            XLSX.utils.book_append_sheet(workbook, difficultiesSheet, "Độ khó")

            const typesData = [["Kiểu câu hỏi có sẵn"], ...types.map((type) => [type.name])]
            const typesSheet = XLSX.utils.aoa_to_sheet(typesData)
            typesSheet["!cols"] = [{ wch: 20 }]
            XLSX.utils.book_append_sheet(workbook, typesSheet, "Kiểu câu hỏi")

            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            })

            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "mau-cau-hoi-quiz.xlsx"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)

            toast.success("Mẫu câu hỏi quiz đã được tải xuống dưới dạng file Excel")
        } catch (error) {
            toast.error("Không thể tạo file Excel")
            console.error("Lỗi tạo Excel:", error)
        }
    }

    const flattenedData = sampleQuestions.flatMap((question) =>
        question.answers.map((answer) => ({
            id: question.id,
            content: question.content,
            category: question.category,
            difficulty: question.difficulty,
            type: question.type,
            answer: answer.answer,
            correct: answer.correct,
        })),
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-purple-900">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900">Mẫu File Excel Câu Hỏi Quiz</h1>
                    <p className="text-gray-600">
                        Mỗi câu hỏi phải sử dụng 1 giá trị trong mỗi phần Danh mục, Độ khó và Kiểu câu hỏi.
                    </p>
                </div>

                {/* Ghi chú quan trọng */}
                <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                        <strong>Ghi chú quan trọng:</strong>
                        <ul className="mt-2 space-y-1 list-disc list-inside">
                            <li>Với mỗi giá trị danh mục, độ khó, kiểu câu hỏi - hãy chọn 1 trong các dữ liệu sẵn có bên dưới</li>
                            <li>Số lượng câu trả lời của 1 câu hỏi nhiều nhất là 4</li>
                            <li>
                                Kiểu câu hỏi mặc định: multi-choice (nhiều lựa chọn), single-choice (một lựa chọn), true-false
                                (đúng/sai)
                            </li>
                        </ul>
                    </AlertDescription>
                </Alert>

                {/* Configuration Rows */}
                <div className="grid gap-6">
                    {/* Categories Row */}
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold text-purple-700">Danh mục</CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopyRow("categories", categories)}
                                    className="bg-white hover:bg-purple-50"
                                >
                                    {copiedRow === 0 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer transition-colors"
                                        onClick={async () => {
                                            try {
                                                await navigator.clipboard.writeText(category.name)
                                                toast.success(`Danh mục "${category.name}" đã được sao chép`)
                                            } catch (err) {
                                                toast.error("Không thể sao chép vào clipboard")
                                            }
                                        }}
                                    >
                                        {category.name}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Types Row */}
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold text-blue-700">Kiểu câu hỏi</CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopyRow("types", types)}
                                    className="bg-white hover:bg-blue-50"
                                >
                                    {copiedRow === 1 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {types.map((type, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer transition-colors"
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(type.name)
                                                    toast.success(`Kiểu câu hỏi "${type.name}" đã được sao chép`)
                                                } catch (err) {
                                                    toast.error("Không thể sao chép vào clipboard")
                                                }
                                            }}
                                        >
                                            {type.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Difficulties Row */}
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold text-green-700">Độ khó</CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopyRow("difficulties", difficulties)}
                                    className="bg-white hover:bg-green-50"
                                >
                                    {copiedRow === 2 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {difficulties.map((difficulty, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer transition-colors"
                                        onClick={async () => {
                                            try {
                                                await navigator.clipboard.writeText(difficulty.name)
                                                toast.success(`Độ khó "${difficulty.name}" đã được sao chép`)
                                            } catch (err) {
                                                toast.error("Không thể sao chép vào clipboard")
                                            }
                                        }}
                                    >
                                        {difficulty.name}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Excel-like Table */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-semibold text-gray-800">Mẫu câu hỏi</CardTitle>
                                <p className="text-sm text-gray-600">Dữ liệu mẫu hiển thị cấu trúc cho từng kiểu câu hỏi</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadTemplate}
                                className="cursor-pointer bg-white hover:bg-gray-50"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Tải xuống dữ liệu mẫu (.xlsx)
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-semibold">ID</TableHead>
                                        <TableHead className="font-semibold">Nội dung</TableHead>
                                        <TableHead className="font-semibold">Danh mục</TableHead>
                                        <TableHead className="font-semibold">Độ khó</TableHead>
                                        <TableHead className="font-semibold">Kiểu câu hỏi</TableHead>
                                        <TableHead className="font-semibold">Đáp án</TableHead>
                                        <TableHead className="font-semibold">Đúng/Sai</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {flattenedData.map((row, index) => (
                                        <TableRow key={index} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{row.id}</TableCell>
                                            <TableCell className="max-w-xs">{row.content}</TableCell>
                                            <TableCell title="Thay bằng 1 trong các Danh mục ở trên">
                                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                                    {row.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell title="Thay bằng 1 trong các Độ khó ở trên">
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    {row.difficulty}
                                                </Badge>
                                            </TableCell>
                                            <TableCell title="Thay bằng 1 trong các Kiểu câu hỏi ở trên">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {row.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{row.answer}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={row.correct ? "default" : "secondary"}
                                                    className={
                                                        row.correct
                                                            ? "bg-green-500 hover:bg-green-600 text-white"
                                                            : "bg-red-500 hover:bg-red-600 text-white"
                                                    }
                                                >
                                                    {row.correct ? "ĐÚNG" : "SAI"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
