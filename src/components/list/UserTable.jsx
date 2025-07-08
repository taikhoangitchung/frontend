"use client"

import React, { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2, Search } from "lucide-react"
import UserService from "../../services/UserService"
import EmailService from "../../services/EmailService"
import { Card, CardContent } from "../ui/card"
import { Input } from "../ui/input"
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table } from "../ui/table"
import { Button } from "../ui/button"
import UserStatusSwitch from "../alerts-confirms/UserStatusSwitch"

const UserTable = () => {
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [reload, setReload] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPage, setTotalPage] = useState(1)
    const questionPerPage = 20
    const [searchTerm, setSearchTerm] = useState("")

    const [isLoadingPagination, setIsLoadingPagination] = useState({
        prevPage: false,
        nextPage: false
    })

    function formatDateFromArray(arr) {
        if (arr === null) {
            return "---";
        }
        const [year, month, day] = arr;
        const dd = String(day).padStart(2, '0');
        const mm = String(month).padStart(2, '0');
        return `${dd}-${mm}-${year}`;
    }

// ✅ API call
    useEffect(() => {
        setIsLoading(true)
        const fetchUsers = async () => {
            try {
                let res
                if (searchTerm.trim() === "") {
                    res = await UserService.getAllExceptAdmin()
                } else {
                    res = await UserService.searchFollowNameAndEmail(searchTerm, searchTerm)
                }
                handlePagination(res)
            } catch (err) {
                console.error("Lỗi khi tải danh sách người dùng:", err)
                toast.error("Không thể tải danh sách người dùng. Vui lòng thử lại.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchUsers()
    }, [page, searchTerm, reload])


    const handlePagination = (res) => {
        setTotalPage(Math.ceil(res.data.length / questionPerPage))
        const start = page === 1 ? 0 : (page - 1) * questionPerPage
        const end = start + questionPerPage
        const thisPageItems = res.data.slice(start, end)
        setUsers([...thisPageItems])
    }

    const handlePrePage = () => {
        setIsLoadingPagination(prev => ({ ...prev, prevPage: true }))
        setPage(page - 1)
        setTimeout(() => {
            setIsLoadingPagination(prev => ({ ...prev, prevPage: false }))
        }, 300) // Giả lập loading ngắn
    }

    const handleNextPage = () => {
        setIsLoadingPagination(prev => ({ ...prev, nextPage: true }))
        setPage(page + 1)
        setTimeout(() => {
            setIsLoadingPagination(prev => ({ ...prev, nextPage: false }))
        }, 300) // Giả lập loading ngắn
    }

    async function handleToggleUserStatus(user, isActive) {
        try {
            setIsLoading(true)
            if (!isActive) {
                await UserService.blockUser(user.id)
                await EmailService.sendAnnounce({
                    to: user.email,
                    subject: "Thông báo từ Quizizz Gym",
                    html: "Tài khoản của bạn đã bị khóa",
                })
                toast.error(`Đã khóa tài khoản ${user.email}`)
            } else {
                await UserService.unblockUser(user.id)
                await EmailService.sendAnnounce({
                    to: user.email,
                    subject: "Thông báo từ Quizizz Gym",
                    html: "Tài khoản của bạn đã được mở khóa",
                })
                toast.success(`Đã mở khóa tài khoản ${user.email}`)
            }
            setReload(!reload)
        } catch (error) {
            toast.error(error?.response?.data || "Có lỗi xảy ra khi cập nhật trạng thái.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Main Content Area */}
                <main className="flex-1 p-10 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        {/* User List */}
                        <Card className="shadow-sm border-gray-200">
                            <CardContent className="p-0">
                                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold">Danh sách người dùng</h2>
                                    <div className="flex items-center relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 w-4 h-4"/>
                                        <Input
                                            placeholder="Tìm kiếm theo tên hoặc email"
                                            className="w-64 h-9 mr-2 pl-10 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-200 border border-gray-500"
                                            onChange={(e) => {
                                                setIsLoading(true)
                                                setSearchTerm(e.target.value)
                                            }}
                                        />
                                    </div>
                                </div>

                                {isLoading ? (
                                    <div className="flex justify-center items-center py-10">
                                        <Loader2 className="h-6 w-6 animate-spin text-purple-600 mr-2" />
                                        <span className="text-gray-600 text-sm">Đang tải danh sách người dùng...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                                    <TableCell className="py-3 px-4 font-medium">ID</TableCell>
                                                    <TableHead className="py-3 px-4 text-gray-700 font-medium">Email</TableHead>
                                                    <TableHead className="py-3 px-4 text-gray-700 font-medium">Tên hiển thị</TableHead>
                                                    <TableHead className="py-3 px-4 text-gray-700 font-medium">Ngày tạo</TableHead>
                                                    <TableHead className="py-3 px-4 text-gray-700 font-medium">Lần truy cập cuối</TableHead>
                                                    <TableHead className="py-3 px-4 text-gray-700 font-medium">Khóa/Mở khóa</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {!isLoading && users.length === 0 && (searchTerm) ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6}>
                                                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                                                <Search className="w-12 h-12 mb-4 opacity-50" />
                                                                <p>Không tìm thấy người dùng nào với từ khóa "{searchTerm}"</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    users.map((user) => (
                                                        <TableRow key={user.id} className="hover:bg-purple-50 border-b border-gray-100">
                                                            <TableCell className="py-3 px-4 font-medium">{user.id}</TableCell>
                                                            <TableCell className="py-3 px-4 font-medium">{user.email}</TableCell>
                                                            <TableCell className="py-3 px-4">{user.username}</TableCell>
                                                            <TableCell className="py-3 px-4 text-gray-600">{formatDateFromArray(user.createAt)}</TableCell>
                                                            <TableCell className="py-3 px-4 text-gray-600">{formatDateFromArray(user.lastLogin)}</TableCell>
                                                            <TableCell className="py-3 px-4 text-gray-600">
                                                                <UserStatusSwitch user={user} onToggle={handleToggleUserStatus} />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>

                                        {/* Pagination */}
                                        <div className="flex justify-center items-center py-4 px-4 gap-2 border-t border-gray-100">
                                            {page !== 1 && (
                                                <Button
                                                    variant="outline"
                                                    onClick={handlePrePage}
                                                    className="border-purple-200 hover:bg-purple-100 hover:text-purple-700 text-sm cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                                                    disabled={isLoadingPagination.prevPage}
                                                >
                                                    {isLoadingPagination.prevPage ? (
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : null}
                                                    Trang trước
                                                </Button>
                                            )}
                                            <Button
                                                className="text-blue-700"
                                                disabled
                                            >
                                                {page}/{totalPage}
                                            </Button>
                                            {page !== totalPage && (
                                                <Button
                                                    variant="outline"
                                                    onClick={handleNextPage}
                                                    className="border-purple-200 hover:bg-purple-100 hover:text-purple-700 text-sm cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                                                    disabled={isLoadingPagination.nextPage}
                                                >
                                                    {isLoadingPagination.nextPage ? (
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : null}
                                                    Trang sau
                                                </Button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default UserTable