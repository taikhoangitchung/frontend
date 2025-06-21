"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {toast} from "sonner"
import {Card, CardContent, CardHeader} from "../ui/card"
import {Button} from "../ui/button"
import {Input} from "../ui/input"
import {Separator} from "../ui/separator"
import {Pencil, Plus, Search, FileText, ListCheck} from "lucide-react"
import CategoryService from "../../services/CategoryService"
import {Skeleton} from "../ui/skeleton"
import DeleteButton from "../alerts-confirms/DeleleButton"

const ITEMS_PER_PAGE = 10

const CategoryTable = ({viewMode = "ADMIN"}) => {
    const [categories, setCategories] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const res = await CategoryService.getAll()
            const sorted = res.data.sort((a, b) =>
                a.name.localeCompare(b.name, "vi", {sensitivity: "base"})
            )
            setCategories(sorted)
        } catch (error) {
            if (error.response?.status === 403) {
                router.push("/forbidden")
            } else if (error.response?.status === 401) {
                toast.error("Token hết hạn hoặc không hợp lệ. Đang chuyển hướng về trang đăng nhập...")
                setTimeout(() => {
                    router.push("/login")
                }, 2500)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleDelete = async (id) => {
        try {
            await CategoryService.delete(id)
            toast.success("Xóa danh mục thành công.")
            await fetchCategories()
        } catch (err) {
            console.error(err)
            toast.error(err.response?.data)
        }
    }

    const handleEdit = (id) => {
        router.push(`/admin/categories/${id}/edit`)
    }

    const handleCreate = () => {
        router.push(`/admin/categories/create`)
    }

    const filteredCategories = searchTerm
        ? categories.filter(
            (cat) =>
                cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : categories

    const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)
    const paginatedCategories = filteredCategories.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="space-y-4 flex flex-col items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Danh sách danh mục</h1>

                {/* Search Input with Icon */}
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
                    <Input
                        placeholder="Nhập tên danh mục cần tìm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <Separator/>

            {/* Categories Section */}
            <div className="space-y-4">
                {/* Categories Header */}
                <div className="flex items-center justify-between">
                    <div className="text-lg font-medium">Tổng số: {filteredCategories.length}</div>
                    {viewMode === "ADMIN" && (
                        <Button
                            onClick={handleCreate}
                            className="bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300"
                            variant="outline"
                        >
                            <Plus className="w-4 h-4 mr-2"/>
                            Thêm danh mục
                        </Button>
                    )}
                </div>

                {/* Category Cards */}
                {paginatedCategories.map((category, index) => (
                    <Card key={category.id} className="border border-gray-200 px-4 py-3">
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl sm:text-2xl font-bold text-purple-800">
                                    {index + 1}. {category.name}
                                </h2>

                                {viewMode === "ADMIN" && (
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-1 text-primary"
                                            onClick={() => handleEdit(category.id)}
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </Button>
                                        <DeleteButton id={category.id} handleDelete={handleDelete} />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    <span>{category.description || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <ListCheck className="w-4 h-4 text-green-600" />
                                    <span className="font-semibold">{category.questionCount || 0} câu hỏi</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div className="space-y-4">
                    {Array.from({length: ITEMS_PER_PAGE}).map((_, idx) => (
                        <Card key={idx} className="border border-gray-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-4 w-20 rounded"/>
                                    <div className="ml-auto flex gap-2">
                                        <Skeleton className="h-6 w-6 rounded-full"/>
                                        <Skeleton className="h-6 w-6 rounded-full"/>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-5 w-1/3 rounded"/>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Skeleton className="h-10 rounded"/>
                                    <Skeleton className="h-10 rounded"/>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* No results */}
            {!loading && paginatedCategories.length === 0 && searchTerm && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Search className="w-12 h-12 mb-4 opacity-50"/>
                    <p>Không tìm thấy danh mục nào với từ khóa "{searchTerm}"</p>
                </div>
            )}

            {!loading && categories.length === 0 && !searchTerm && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <p>Danh sách trống!</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6 text-sm text-muted-foreground">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Trang trước
                    </Button>
                    <span className="font-medium">
            Trang {currentPage} / {totalPages}
          </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Trang sau
                    </Button>
                </div>
            )}
        </div>
    )
}

export default CategoryTable
