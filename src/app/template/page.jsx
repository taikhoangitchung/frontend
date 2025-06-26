"use client"

import {useEffect, useState} from "react"
import {Copy, Check, Download, Loader2} from "lucide-react"
import CategoryService from "../../services/CategoryService";
import DifficultyService from "../../services/DifficultyService";
import TypeService from "../../services/TypeService";
import {toast} from "sonner";
import {Card, CardContent, CardHeader, CardTitle} from "../../components/ui/card";
import {Button} from "../../components/ui/button";
import {Badge} from "../../components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../../components/ui/table";
import * as XLSX from "xlsx";

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
            const message = error?.response?.data || "An error occurred"
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const sampleQuestions = [
        {
            id: 1,
            content: "Which of the following are programming languages?",
            category: "Category",
            difficulty: "difficulty",
            type: "multi-choice",
            answers: [
                { answer: "Java", correct: true },
                { answer: "Python", correct: true },
                { answer: "Coffee", correct: false },
                { answer: "JavaScript", correct: true },
                { answer: "Tea", correct: false },
            ],
        },
        {
            id: 2,
            content: "Capital of France?",
            category: "Category",
            difficulty: "difficulty",
            type: "single-choice",
            answers: [
                { answer: "Paris", correct: true },
                { answer: "Berlin", correct: false },
                { answer: "Madrid", correct: false },
            ],
        },
        {
            id: 3,
            content: "The Earth is flat",
            category: "Category",
            difficulty: "difficulty",
            type: "true-false",
            answers: [
                { answer: "True", correct: false },
                { answer: "False", correct: true },
            ],
        },
    ]

    const handleCopyRow = async (rowType, data) => {
        const textToCopy = data.map((item) => item.name).join(", ")
        try {
            await navigator.clipboard.writeText(textToCopy)
            const rowIndex = rowType === "categories" ? 0 : rowType === "types" ? 1 : 2
            setCopiedRow(rowIndex)
            toast.success(`${rowType} list copied successfully`)
            setTimeout(() => setCopiedRow(null), 2000)
        } catch (err) {
            toast.error("Failed to copy to clipboard")
        }
    }

    const handleDownloadTemplate = () => {
        try {
            const workbook = XLSX.utils.book_new()

            const headers = ["ID", "Content", "Category", "Difficulty", "Type", "Answer", "Correct"]
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

            XLSX.utils.book_append_sheet(workbook, templateSheet, "Quiz Template")

            // Categories reference sheet
            const categoriesData = [["Available Categories"], ...categories.map((cat) => [cat.name])]
            const categoriesSheet = XLSX.utils.aoa_to_sheet(categoriesData)
            categoriesSheet["!cols"] = [{ wch: 20 }]
            XLSX.utils.book_append_sheet(workbook, categoriesSheet, "Categories")

            // Difficulties reference sheet
            const difficultiesData = [["Available Difficulties"], ...difficulties.map((diff) => [diff.name])]
            const difficultiesSheet = XLSX.utils.aoa_to_sheet(difficultiesData)
            difficultiesSheet["!cols"] = [{ wch: 20 }]
            XLSX.utils.book_append_sheet(workbook, difficultiesSheet, "Difficulties")

            // Types reference sheet
            const typesData = [["Available Types"], ...types.map((type) => [type.name])]
            const typesSheet = XLSX.utils.aoa_to_sheet(typesData)
            typesSheet["!cols"] = [{ wch: 20 }]
            XLSX.utils.book_append_sheet(workbook, typesSheet, "Types")

            // Generate and download the file
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            })

            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "quiz-template.xlsx"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)

            toast.success("Quiz template has been downloaded as Excel file")
        } catch (error) {
            toast.error("Failed to generate Excel file")
            console.error("Excel generation error:", error)
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
                    <h1 className="text-4xl font-bold text-gray-900">Template File Excel</h1>
                    <p className="text-gray-600">
                        Each question is guaranteed to use 1 value in each of the Category, Difficulty and Type sections.
                    </p>
                </div>

                {/* Configuration Rows */}
                <div className="grid gap-6">
                    {/* Categories Row */}
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold text-purple-700">Categories</CardTitle>
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
                                    <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                                        {category.name}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Types Row */}
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold text-blue-700">Question Types</CardTitle>
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
                            <div className="flex flex-wrap gap-2">
                                {types.map((type, index) => (
                                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                        {type.name}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Difficulties Row */}
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold text-green-700">Difficulty Levels</CardTitle>
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
                                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
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
                                <CardTitle className="text-xl font-semibold text-gray-800">Question Template</CardTitle>
                                <p className="text-sm text-gray-600">Sample data showing the structure for each question type</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadTemplate}
                                className="bg-white hover:bg-gray-50"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Excel
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-semibold">ID</TableHead>
                                        <TableHead className="font-semibold">Content</TableHead>
                                        <TableHead className="font-semibold">Category</TableHead>
                                        <TableHead className="font-semibold">Difficulty</TableHead>
                                        <TableHead className="font-semibold">Type</TableHead>
                                        <TableHead className="font-semibold">Answer</TableHead>
                                        <TableHead className="font-semibold">Correct</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {flattenedData.map((row, index) => (
                                        <TableRow key={index} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{row.id}</TableCell>
                                            <TableCell className="max-w-xs">{row.content}</TableCell>
                                            <TableCell title="Thay bằng 1 trong các Category ở trên">
                                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                                    {row.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell title="Thay bằng 1 trong các Difficulty ở trên">
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    {row.difficulty}
                                                </Badge>
                                            </TableCell>
                                            <TableCell title="Thay bằng 1 trong các Type ở trên">
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
                                                    {row.correct ? "TRUE" : "FALSE"}
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


// export default function QuizInterface() {
//     const [copiedRow, setCopiedRow] = useState(null);
//     const [categories, setCategories] = useState([]);
//     const [difficulties, setDifficulties] = useState([]);
//     const [types, setTypes] = useState([]);
//     const [loading, setLoading] = useState(false);
//
//     useEffect(() => {
//         fetchData();
//     }, []);
//
//     const fetchData = async () => {
//         try {
//             setLoading(true);
//             const resCategory = await CategoryService.getAll();
//             setCategories(resCategory.data);
//
//             const resDifficulty = await DifficultyService.getAll();
//             setDifficulties(resDifficulty.data);
//
//             const resType = await TypeService.getAll();
//             setTypes(resType.data);
//         } catch (error) {
//             const message = error?.response?.data;
//             toast.warning(message);
//         } finally {
//             setLoading(false);
//         }
//     }
//
//     const sampleQuestions = [
//         {
//             id: 1,
//             content: "Which of the following are programming languages?",
//             category: `Category`,
//             difficulty: `difficulty`,
//             type: "multi-choice",
//             answers: [
//                 {answer: "Java", correct: true},
//                 {answer: "Python", correct: true},
//                 {answer: "Coffee", correct: false},
//                 {answer: "JavaScript", correct: true},
//                 {answer: "Tea", correct: false},
//             ],
//         },
//         {
//             id: 2,
//             content: "Capital of France?",
//             category: `Category`,
//             difficulty: `difficulty`,
//             type: "single-choice",
//             answers: [
//                 {answer: "Paris", correct: true},
//                 {answer: "Berlin", correct: false},
//                 {answer: "Madrid", correct: false},
//             ],
//         },
//         {
//             id: 3,
//             content: "The Earth is flat",
//             category: `Category`,
//             difficulty: `difficulty`,
//             type: "true-false",
//             answers: [
//                 {answer: "True", correct: false},
//                 {answer: "False", correct: true},
//             ],
//         },
//     ]
//
//     const handleCopyRow = async (rowType, data) => {
//         const textToCopy = data.join(", ")
//         try {
//             await navigator.clipboard.writeText(textToCopy)
//             const rowIndex = rowType === "categories" ? 0 : rowType === "types" ? 1 : 2
//             setCopiedRow(rowIndex)
//             toast({
//                 title: "Copied to clipboard",
//                 description: `${rowType} list copied successfully`,
//             })
//             setTimeout(() => setCopiedRow(null), 2000)
//         } catch (err) {
//             toast({
//                 title: "Copy failed",
//                 description: "Failed to copy to clipboard",
//                 variant: "destructive",
//             })
//         }
//     }
//
//     const handleDownloadTemplate = () => {
//         const headers = ["ID", "Content", "Category", "Difficulty", "Type", "Answer", "Correct"]
//         const csvContent = [
//             headers.join(","),
//             ...flattenedData.map((row) =>
//                 [row.id, `"${row.content}"`, row.category, row.difficulty, row.type, `"${row.answer}"`, row.correct].join(","),
//             ),
//         ].join("\n")
//
//         const blob = new Blob([csvContent], {type: "text/csv"})
//         const url = window.URL.createObjectURL(blob)
//         const a = document.createElement("a")
//         a.href = url
//         a.download = "quiz-template.csv"
//         document.body.appendChild(a)
//         a.click()
//         document.body.removeChild(a)
//         window.URL.revokeObjectURL(url)
//
//         toast.info("Quiz template has been downloaded as CSV file");
//     }
//
//     const flattenedData = sampleQuestions.flatMap((question) =>
//         question.answers.map((answer) => ({
//             id: question.id,
//             content: question.content,
//             category: question.category,
//             difficulty: question.difficulty,
//             type: question.type,
//             answer: answer.answer,
//             correct: answer.correct,
//         })),
//     )
//
//     if (loading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen bg-purple-900">
//                 <Loader2 className="h-8 w-8 animate-spin text-white"/>
//             </div>
//         )
//     }
//
//     return (
//         <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
//             <div className="max-w-7xl mx-auto space-y-8">
//                 {/* Header */}
//                 <div className="text-center space-y-2">
//                     <h1 className="text-4xl font-bold text-gray-900">Template File Excel</h1>
//                     <p className="text-gray-600">Each question is guaranteed to use 1 value in each of the Category, Difficulty and Type sections.</p>
//                 </div>
//
//                 {/* Configuration Rows */}
//                 <div className="grid gap-6">
//                     {/* Categories Row */}
//                     <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
//                         <CardHeader className="pb-4">
//                             <div className="flex items-center justify-between">
//                                 <CardTitle className="text-lg font-semibold text-purple-700">Categories</CardTitle>
//                                 <Button
//                                     variant="outline"
//                                     size="sm"
//                                     onClick={() => handleCopyRow("categories", categories)}
//                                     className="bg-white hover:bg-purple-50"
//                                 >
//                                     {copiedRow === 0 ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}
//                                 </Button>
//                             </div>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="flex flex-wrap gap-2">
//                                 {categories.map((category, index) => (
//                                     <Badge key={index} variant="secondary"
//                                            className="bg-purple-100 text-purple-700 hover:bg-purple-200">
//                                         {category.name}
//                                     </Badge>
//                                 ))}
//                             </div>
//                         </CardContent>
//                     </Card>
//
//                     {/* Types Row */}
//                     <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
//                         <CardHeader className="pb-4">
//                             <div className="flex items-center justify-between">
//                                 <CardTitle className="text-lg font-semibold text-blue-700">Question Types</CardTitle>
//                                 <Button
//                                     variant="outline"
//                                     size="sm"
//                                     onClick={() => handleCopyRow("types", types)}
//                                     className="bg-white hover:bg-blue-50"
//                                 >
//                                     {copiedRow === 1 ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}
//                                 </Button>
//                             </div>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="flex flex-wrap gap-2">
//                                 {types.map((type, index) => (
//                                     <Badge key={index} variant="secondary"
//                                            className="bg-blue-100 text-blue-700 hover:bg-blue-200">
//                                         {type.name}
//                                     </Badge>
//                                 ))}
//                             </div>
//                         </CardContent>
//                     </Card>
//
//                     {/* Difficulties Row */}
//                     <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
//                         <CardHeader className="pb-4">
//                             <div className="flex items-center justify-between">
//                                 <CardTitle className="text-lg font-semibold text-green-700">Difficulty
//                                     Levels</CardTitle>
//                                 <Button
//                                     variant="outline"
//                                     size="sm"
//                                     onClick={() => handleCopyRow("difficulties", difficulties)}
//                                     className="bg-white hover:bg-green-50"
//                                 >
//                                     {copiedRow === 2 ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}
//                                 </Button>
//                             </div>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="flex flex-wrap gap-2">
//                                 {difficulties.map((difficulty, index) => (
//                                     <Badge key={index} variant="secondary"
//                                            className="bg-green-100 text-green-700 hover:bg-green-200">
//                                         {difficulty.name}
//                                     </Badge>
//                                 ))}
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </div>
//
//                 {/* Excel-like Table */}
//                 <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
//                     <CardHeader>
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <CardTitle className="text-xl font-semibold text-gray-800">Question Template</CardTitle>
//                                 <p className="text-sm text-gray-600">Sample data showing the structure for each question
//                                     type</p>
//                             </div>
//                             <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={handleDownloadTemplate}
//                                 className="bg-white hover:bg-gray-50"
//                             >
//                                 <Download className="h-4 w-4"/>
//                             </Button>
//                         </div>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="overflow-x-auto">
//                             <Table>
//                                 <TableHeader>
//                                     <TableRow className="bg-gray-50">
//                                         <TableHead className="font-semibold">ID</TableHead>
//                                         <TableHead className="font-semibold">Content</TableHead>
//                                         <TableHead className="font-semibold">Category</TableHead>
//                                         <TableHead className="font-semibold">Difficulty</TableHead>
//                                         <TableHead className="font-semibold">Type</TableHead>
//                                         <TableHead className="font-semibold">Answer</TableHead>
//                                         <TableHead className="font-semibold">Correct</TableHead>
//                                     </TableRow>
//                                 </TableHeader>
//                                 <TableBody>
//                                     {flattenedData.map((row, index) => (
//                                         <TableRow key={index} className="hover:bg-gray-50">
//                                             <TableCell className="font-medium">{row.id}</TableCell>
//                                             <TableCell className="max-w-xs">{row.content}</TableCell>
//                                             <TableCell title={"Thay bằng 1 trong các Category ở trên"}>
//                                                 <Badge variant="outline"
//                                                        className="bg-purple-50 text-purple-700 border-purple-200">
//                                                     {row.category}
//                                                 </Badge>
//                                             </TableCell>
//                                             <TableCell title={"Thay bằng 1 trong các Difficulty ở trên"}>
//                                                 <Badge variant="outline"
//                                                        className="bg-green-50 text-green-700 border-green-200">
//                                                     {row.difficulty}
//                                                 </Badge>
//                                             </TableCell>
//                                             <TableCell title={"Thay bằng 1 trong các Type ở trên"}>
//                                                 <Badge variant="outline"
//                                                        className="bg-blue-50 text-blue-700 border-blue-200">
//                                                     {row.type}
//                                                 </Badge>
//                                             </TableCell>
//                                             <TableCell>{row.answer}</TableCell>
//                                             <TableCell>
//                                                 <Badge
//                                                     variant={row.correct ? "default" : "secondary"}
//                                                     className={
//                                                         row.correct ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
//                                                     }
//                                                 >
//                                                     {row.correct ? "TRUE" : "FALSE"}
//                                                 </Badge>
//                                             </TableCell>
//                                         </TableRow>
//                                     ))}
//                                 </TableBody>
//                             </Table>
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>
//         </div>
//     )
// }
