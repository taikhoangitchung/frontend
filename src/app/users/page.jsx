"use client"

import {useEffect, useState} from "react";
import UserService from "../../services/UserService";
import styles from "./styles.css";

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const questionPerPage = 20;

    useEffect(() => {
        setIsLoading(true);
        try {
            // const token = localStorage.getItem("token");
            // const payloadBase64 = token.split('.')[1];
            // if (!payloadBase64) throw new Error('Token không hợp lệ');
            //
            // const decodedPayload = atob(payloadBase64);
            // const payload = JSON.parse(decodedPayload);
            //
            // const userId = payload.user_id;
            //

            UserService.getAllExceptAdmin()
                .then(res => {
                    console.log(res);
                    setTotalPage(Math.ceil(res.data.length / questionPerPage));
                    const start = page === 1 ? 0 : (page - 1) * questionPerPage;
                    const end = start + questionPerPage;

                    const thisPageItems = res.data.slice(start, end);
                    setUsers([...thisPageItems]);
                })
                .catch(err => console.log(err));
        } catch (error) {
            console.error('Lỗi khi giải mã token:', error.message);
        }

        setIsLoading(false);
    }, [page,]);

    const handlePrePage = () => {
        setPage(page - 1);
    }

    const handleNextPage = () => {
        setPage(page + 1);
    }

    if (isLoading) return <h1>Is Loading .....</h1>;

    return (
        <div className="container">
            <h2>Danh sách người dùng</h2>
            <table className="user-table">
                <thead>
                <tr>
                    <th>Email</th>
                    <th>Tên hiển thị</th>
                    <th>Ngày tạo</th>
                    <th>Lần truy cập cuối</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>{user.username}</td>
                        <td>{user.createAt}</td>
                        <td>{user.lastLogin}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div className="pagination">
                {page !== 1 && <button className={"btn"} id={"prev-btn"} onClick={handlePrePage}>Trang trước</button>}
                <button className={"btn"}>{page}</button>
                {page !== totalPage && <button className={"btn"} id={"next-btn"} onClick={handleNextPage}>Trang sau</button>}
            </div>
        </div>
    );
}

export default UserList;
