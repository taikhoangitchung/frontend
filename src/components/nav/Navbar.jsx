"use client"

import {useEffect, useState} from "react";
import styles from "./styles.css"
import QuestionService from "../../services/QuestionService";
import {useRouter} from "next/navigation";
import Link from 'next/link'
import UserService from "../../services/UserService";

const Navbar = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        // if (!token) {
        //     setIsLogin(false);
        //     router.push("/login");
        // }

        UserService.isAdmin(6)
            .then(res => setIsAdmin(res.data))
            .catch(err => console.log(err));

        setIsLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLogin(false);
    }

    if (isLoading) return <h1>Is Loading .....</h1>;

    return (
        <nav className="navbar">
            <div className="nav-left">
                <Link href={"/"}>Home</Link>
                {isLogin && <a href="#">Create a Quiz</a>}
            </div>
            <div className="user-menu">
                {isLogin ? (<>
                            <span className="user-icon">👤</span>
                            <div className="dropdown">
                                <a href="#">Information</a>
                                <Link href={"/questions/my"}>My Questions</Link>
                                {isAdmin && <Link href={"/users"}>Dashboard</Link>}
                                <a onClick={handleLogout}>Log out</a>
                            </div>
                        </>
                    )
                    : (<>
                            <Link href={"/"}>Log in</Link>
                            <Link href={"/"}>Register</Link>
                        </>
                    )}
            </div>
        </nav>
    );
}

export default Navbar;
