"use client"

import {useEffect, useState} from "react"
import {Download} from "lucide-react"
import {Card, CardContent, CardHeader, CardTitle} from "../../components/ui/card";
import {Button} from "../../components/ui/button";
import {Input} from "../../components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../components/ui/select";
import * as ExcelJS from "exceljs";
import {saveAs} from "file-saver"
import CategoryService from "../../services/CategoryService";
import DifficultyService from "../../services/DifficultyService";
import TypeService from "../../services/TypeService";
import {toast} from "sonner";

export default function ExcelTemplate() {
    const [questions, setQuestions] = useState([
        {
            id: "1",
            content: "Ưu điểm của Java là gì ?",
            category: "Địa lý",
            difficulty: "Dễ",
            type: "Nhiều lựa chọn",
            answer1: "Tính đa nền tảng",
            answer2: "Hướng đối tượng rõ ràng",
            answer3: "Bảo mật và quản lý bộ nhớ tốt",
            answer4: "Hiệu suất chậm hơn so với ngôn ngữ biên dịch như C/C++",
            correct: "1,2,3",
        },
        {
            id: "2",
            content: "2 + 2 = ?",
            category: "Toán học",
            difficulty: "Dễ",
            type: "Một lựa chọn",
            answer1: "3",
            answer2: "4",
            answer3: "5",
            answer4: "6",
            correct: "4",
        },
        {
            id: "3",
            content: "Trái đất quay quanh mặt trời",
            category: "Khoa học",
            difficulty: "Dễ",
            type: "Đúng/Sai",
            answer1: "Đúng",
            answer2: "Sai",
            answer3: "",
            answer4: "",
            correct: "1",
        },
    ])
    const [categories, setCategories] = useState([]);
    const [difficulties, setDifficulties] = useState([]);
    const [types, setTypes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resCategories = await CategoryService.getAll();
                setCategories(resCategories.data.map(category => category.name));
                const resDifficulties = await DifficultyService.getAll();
                setDifficulties(resDifficulties.data.map(difficulty => difficulty.name));
                const resTypes = await TypeService.getAll();
                setTypes(resTypes.data.map(type => type.name));
            } catch (error) {
                toast.error(error?.response?.data || "Lỗi khi lấy dữ liệu")
            }
        }

        fetchData();
    }, []);

    const updateQuestion = (id, field, value) => {
        setQuestions(questions.map((q) => (q.id === id ? {...q, [field]: value} : q)))
    }

    const downloadExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook()
            const questionSheet = workbook.addWorksheet("Câu hỏi")

            questionSheet.columns = [
                {header: "Nội dung", key: "content", width: 50},
                {header: "Danh mục", key: "category", width: 20},
                {header: "Độ khó", key: "difficulty", width: 15},
                {header: "Loại câu hỏi", key: "type", width: 25},
                {header: "Đáp án 1", key: "a1", width: 20},
                {header: "Đáp án 2", key: "a2", width: 20},
                {header: "Đáp án 3", key: "a3", width: 20},
                {header: "Đáp án 4", key: "a4", width: 20},
                {header: "Đáp án đúng", key: "correct", width: 20},
            ]

            questions.forEach((q) => {
                questionSheet.addRow({
                    content: q.content,
                    category: q.category,
                    difficulty: q.difficulty,
                    type: q.type,
                    a1: q.answer1,
                    a2: q.answer2,
                    a3: q.answer3 || "",
                    a4: q.answer4 || "",
                    correct: q.correct,
                })
            })

            for (let i = 2; i <= 100; i++) {
                questionSheet.getCell(`B${i}`).dataValidation = {
                    type: "list",
                    allowBlank: true,
                    formulae: [`"${categories.join(",")}"`],
                }
                questionSheet.getCell(`C${i}`).dataValidation = {
                    type: "list",
                    allowBlank: true,
                    formulae: [`"${difficulties.join(",")}"`],
                }
                questionSheet.getCell(`D${i}`).dataValidation = {
                    type: "list",
                    allowBlank: true,
                    formulae: [`"${types.join(",")}"`],
                }
            }

            const guideSheet = workbook.addWorksheet("Hướng dẫn")
            guideSheet.columns = [
                {header: "Cột", key: "col", width: 20},
                {header: "Mô tả", key: "desc", width: 60},
                {header: "Bắt buộc", key: "required", width: 15},
            ]

            const guideData = [
                {col: "Nội dung", desc: "Nội dung của câu hỏi", required: "Có"},
                {col: "Danh mục", desc: `Chọn một trong: ${categories.join(", ")}`, required: "Có"},
                {col: "Độ khó", desc: `Chọn một trong: ${difficulties.join(", ")}`, required: "Có"},
                {col: "Loại câu hỏi", desc: `Chọn một trong: ${types.join(", ")}`, required: "Có"},
                {col: "Đáp án 1", desc: "Đáp án thứ nhất", required: "Có"},
                {col: "Đáp án 2", desc: "Đáp án thứ hai", required: "Có"},
                {col: "Đáp án 3", desc: "Đáp án thứ ba (tùy chọn với Đúng/Sai)", required: "Tùy chọn"},
                {col: "Đáp án 4", desc: "Đáp án thứ tư (tùy chọn với Đúng/Sai)", required: "Tùy chọn"},
                {col: "Đáp án đúng", desc: "Phải trùng với một trong các đáp án", required: "Có"},
            ]
            guideData.forEach((g) => guideSheet.addRow(g))

            const dropdownSheet = workbook.addWorksheet("Dữ liệu dropdown")
            dropdownSheet.columns = [
                {header: "Loại", key: "type", width: 20},
                {header: "Giá trị", key: "value", width: 60},
            ]

            const dropdownData = [
                {type: "Danh mục", value: categories.join(", ")},
                {type: "Độ khó", value: difficulties.join(", ")},
                {type: "Loại câu hỏi", value: types.join(", ")},
            ]
            dropdownData.forEach((d) => dropdownSheet.addRow(d))

            const buffer = await workbook.xlsx.writeBuffer()
            const now = new Date()
            const timestamp = now.toISOString().slice(0, 19).replace(/:/g, "-")
            const filename = `cau-hoi-quizizz-${timestamp}.xlsx`

            saveAs(new Blob([buffer]), filename)
            toast.success(`File ${filename} đã được tạo thành công!`)
        } catch (error) {
            toast.error("❌ Lỗi khi tạo file Excel:", error)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
            <div className="max-w-7xl mx-auto">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-3xl font-bold flex items-center gap-2 py-6 px-4">
                                📊 Mẫu File Excel (.xlsx)
                            </CardTitle>
                            <Button
                                onClick={downloadExcel}
                                className="bg-white text-purple-600 hover:bg-purple-100 hover:shadow-md font-semibold cursor-pointer transition duration-150"
                            >
                                <Download className="w-4 h-4 mr-2"/>
                                Tải xuống Excel
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700">Danh sách câu hỏi mẫu</h3>
                            <p className="text-sm text-gray-500 mt-1">Bao gồm 3 loại câu hỏi: Trắc nghiệm nhiều lựa
                                chọn, Trắc nghiệm một lựa chọn, và Đúng/Sai</p>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full">
                                <thead>
                                <tr className="bg-gradient-to-r from-purple-100 to-blue-100">
                                    <th className="font-bold text-purple-800 p-3 text-left min-w-[200px] border-b border-gray-200">Nội
                                        dung
                                    </th>
                                    <th className="font-bold text-purple-800 p-3 text-left min-w-[120px] border-b border-gray-200">Danh
                                        mục
                                    </th>
                                    <th className="font-bold text-purple-800 p-3 text-left min-w-[100px] border-b border-gray-200">Độ
                                        khó
                                    </th>
                                    <th className="font-bold text-purple-800 p-3 text-left min-w-[150px] border-b border-gray-200">Loại
                                        câu hỏi
                                    </th>
                                    <th className="font-bold text-purple-800 p-3 text-left min-w-[120px] border-b border-gray-200">Đáp
                                        án 1
                                    </th>
                                    <th className="font-bold text-purple-800 p-3 text-left min-w-[120px] border-b border-gray-200">Đáp
                                        án 2
                                    </th>
                                    <th className="font-bold text-purple-800 p-3 text-left min-w-[120px] border-b border-gray-200">Đáp
                                        án 3
                                    </th>
                                    <th className="font-bold text-purple-800 p-3 text-left min-w-[120px] border-b border-gray-200">Đáp
                                        án 4
                                    </th>
                                    <th className="font-bold text-purple-800 p-3 text-left min-w-[120px] border-b border-gray-200">Đáp
                                        án đúng
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {questions.map((question, index) => (
                                    <tr key={question.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                        <td className="p-3 border-b border-gray-200">
                                            <Input
                                                value={question.content}
                                                onChange={(e) => updateQuestion(question.id, "content", e.target.value)}
                                                placeholder="Nhập nội dung câu hỏi..."
                                                className="border-gray-300 focus:border-purple-500 w-[200px]"
                                            />
                                        </td>
                                        <td className="p-3 border-b border-gray-200">
                                            <Select
                                                value={question.category}
                                                onValueChange={(value) => updateQuestion(question.id, "category", value)}
                                            >
                                                <SelectTrigger className="border-gray-300 focus:border-purple-500">
                                                    <SelectValue placeholder="Chọn danh mục"/>
                                                </SelectTrigger>
                                                <SelectContent className={"bg-white"}>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat} value={cat} className={"cursor-pointer"}>
                                                            {cat}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="p-3 border-b border-gray-200">
                                            <Select
                                                value={question.difficulty}
                                                onValueChange={(value) => updateQuestion(question.id, "difficulty", value)}
                                            >
                                                <SelectTrigger className="border-gray-300 focus:border-purple-500"
>
                                                    <SelectValue placeholder="Độ khó"/>
                                                </SelectTrigger>
                                                <SelectContent className={"bg-white"}>
                                                    {difficulties.map((diff) => (
                                                        <SelectItem key={diff} value={diff} className={"cursor-pointer"}>
                                                            {diff}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="p-3 border-b border-gray-200">
                                            <Select
                                                value={question.type}
                                                onValueChange={(value) => updateQuestion(question.id, "type", value)}
                                            >
                                                <SelectTrigger className="border-gray-300 focus:border-purple-500"
>
                                                    <SelectValue placeholder="Loại câu hỏi"/>
                                                </SelectTrigger>
                                                <SelectContent className={"bg-white"}>
                                                    {types.map((type) => (
                                                        <SelectItem key={type} value={type} className={"cursor-pointer"}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="p-3 border-b border-gray-200">
                                            <Input
                                                value={question.answer1}
                                                onChange={(e) => updateQuestion(question.id, "answer1", e.target.value)}
                                                placeholder="Đáp án A"
                                                className="border-gray-300 focus:border-purple-500 w-[200px]"

                                            />
                                        </td>
                                        <td className="p-3 border-b border-gray-200">
                                            <Input
                                                value={question.answer2}
                                                onChange={(e) => updateQuestion(question.id, "answer2", e.target.value)}
                                                placeholder="Đáp án B"
                                                className="border-gray-300 focus:border-purple-500 w-[200px]"

                                            />
                                        </td>
                                        <td className="p-3 border-b border-gray-200">
                                            <Input
                                                value={question.answer3}
                                                onChange={(e) => updateQuestion(question.id, "answer3", e.target.value)}
                                                placeholder="Đáp án C"
                                                className="border-gray-300 focus:border-purple-500 w-[200px]"

                                                disabled={question.type === "Đúng/Sai"}
                                            />
                                        </td>
                                        <td className="p-3 border-b border-gray-200">
                                            <Input
                                                value={question.answer4}
                                                onChange={(e) => updateQuestion(question.id, "answer4", e.target.value)}
                                                placeholder="Đáp án D"
                                                className="border-gray-300 focus:border-purple-500 w-[200px]"

                                                disabled={question.type === "Đúng/Sai"}
                                            />
                                        </td>
                                        <td className="p-3 border-b border-gray-200">
                                            <Input
                                                value={question.correct}
                                                onChange={(e) => updateQuestion(question.id, "correct", e.target.value)}
                                                placeholder="Đáp án đúng"
                                                className="border-gray-300 focus:border-purple-500 w-[200px]"

                                            />
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-2">📋 Hướng dẫn sử dụng:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                                <div>
                                    <h5 className="font-semibold mb-1">Loại câu hỏi:</h5>
                                    <ul className="space-y-1">
                                        <li>• <strong>Trắc nghiệm nhiều lựa chọn:</strong> Sử dụng tất cả 4 đáp án</li>
                                        <li>• <strong>Trắc nghiệm một lựa chọn:</strong> Có thể sử dụng 2-4 đáp án</li>
                                        <li>• <strong>Đúng/Sai:</strong> Chỉ sử dụng đáp án 1 và 2</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-semibold mb-1">Đáp án đúng : </h5>
                                    <ul className="space-y-1">
                                        <li>• Ví dụ nếu đáp án đúng là Đáp án 1 và Đáp án 2 thì điền vào cột "Đáp án đúng" là 1,2</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
