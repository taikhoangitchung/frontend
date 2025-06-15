"use client"

import {useEffect, useState} from "react"
import {Button} from "../../components/ui/button"
import {Input} from "../../components/ui/input"
import {Card, CardContent} from "../../components/ui/card"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../../components/ui/table"
import UserService from "../../services/UserService"

const UserManager = () => {
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [reload, setReload] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPage, setTotalPage] = useState(1)
    const questionPerPage = 20
    const [keyName, setKeyName] = useState("");
    const [keyEmail, setKeyEmail] = useState("");

    useEffect(() => {
        setIsLoading(true)
        if (keyName.trim() === "" && keyEmail.trim() === "") {
            UserService.getAllExceptAdmin()
                .then(res => handlePagination(res))
                .catch(err => console.log(err))
        } else {
            UserService.searchFollowNameAndEmail(keyName, keyEmail)
                .then(res => handlePagination(res))
                .catch(err => console.log(err));
        }

        setIsLoading(false)
    }, [page,keyName,keyEmail,reload])

    const handlePagination = (res) => {
        setTotalPage(Math.ceil(res.data.length / questionPerPage))
        const start = page === 1 ? 0 : (page - 1) * questionPerPage
        const end = start + questionPerPage

        const thisPageItems = res.data.slice(start, end)
        setUsers([...thisPageItems])
    }

    const handleKeyName = (e) => {
        setKeyName(e.target.value);
    }

    const handleKeyEmail = (e) => {
        setKeyEmail(e.target.value);
    }

    const handleDeleteUser = (id) => {
        if (confirm(`Bạn có muốn xóa người dùng với id ${id}`)) {
            UserService.removeUser(id)
                .then(res => {
                    if (res.data) {
                        alert(`Xóa thành công user : ${id}`);
                        setReload(!reload);
                    }
                    else alert(`Lỗi xóa user ${id}`);
                })
                .catch(err => alert(err));
        }
    }

    const handlePrePage = () => {
        setPage(page - 1)
    }

    const handleNextPage = () => {
        setPage(page + 1)
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
                                    <div className="flex items-center">
                                        <Input placeholder="Tìm kiếm theo tên" className="w-64 h-9 mr-2" onChange={handleKeyName}/>
                                        <Input placeholder="Tìm kiếm theo email" className="w-64 h-9 mr-2" onChange={handleKeyEmail}/>
                                    </div>
                                </div>

                                {isLoading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="text-xl text-purple-700">Đang tải dữ liệu...</div>
                                    </div>
                                ) : (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                                    <TableHead className="py-3 px-4 text-gray-700 font-medium">Email</TableHead>
                                                    <TableHead className="py-3 px-4 text-gray-700 font-medium">Tên hiển thị</TableHead>
                                                    <TableHead className="py-3 px-4 text-gray-700 font-medium">Ngày tạo</TableHead>
                                                    <TableHead className="py-3 px-4 text-gray-700 font-medium">Lần truy cập cuối</TableHead>
                                                    <TableHead className="py-3 px-4 text-gray-700 font-medium">Hành động</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {users.map((user) => (
                                                    <TableRow key={user.id} className="hover:bg-purple-50 border-b border-gray-100">
                                                        <TableCell className="py-3 px-4 font-medium">{user.email}</TableCell>
                                                        <TableCell className="py-3 px-4">{user.username}</TableCell>
                                                        <TableCell className="py-3 px-4 text-gray-600">{user.createAt}</TableCell>
                                                        <TableCell className="py-3 px-4 text-gray-600">{user.lastLogin}</TableCell>
                                                        <TableCell className="py-3 px-4 text-gray-600">
                                                            <Button onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>

                                        {/* Pagination */}
                                        <div className="flex justify-center items-center py-4 px-4 gap-2 border-t border-gray-100">
                                            {page !== 1 && (
                                                <Button
                                                    variant="outline"
                                                    onClick={handlePrePage}
                                                    className="border-purple-200 hover:bg-purple-100 hover:text-purple-700 text-sm"
                                                >
                                                    Trang trước
                                                </Button>
                                            )}
                                            <Button
                                                className="text-blue-700"
                                                disabled
                                            >
                                                {page}
                                            </Button>
                                            {page !== totalPage && (
                                                <Button
                                                    variant="outline"
                                                    onClick={handleNextPage}
                                                    className="border-purple-200 hover:bg-purple-100 hover:text-purple-700 text-sm"
                                                >
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

export default UserManager


