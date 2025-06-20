'use client';

import {AdminSidebar} from "../../../components/layout/AdminSidebar";
import {AppHeader} from "../../../components/layout/AdminHeader";
import UserTable from "../../../components/list/UserTable";
import {useState} from "react";
import CategoryTable from "../../../components/category/CategoryTable";
import TypeTable from "../../../components/list/TypeTable";
import DifficultyTable from "../../../components/list/DifficultyTable";
import {Users} from "lucide-react";

export default function Page() {
    const [selectedMenu, setSelectedMenu] = useState({
        title: "Quản lý người dùng",
        icon: Users,
        component: "users",
        active: false
    });
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <AdminSidebar onSelectMenu={(item) => setSelectedMenu(item)}/>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                <AppHeader/>
                <main className="flex-1 p-6">
                    {selectedMenu?.component === "users" && (<UserTable/>)}
                    {selectedMenu?.component === "categories" && (<CategoryTable/>)}
                    {selectedMenu?.component === "types" && (<TypeTable/>)}
                    {selectedMenu?.component === "difficulties" && (<DifficultyTable/>)}
                </main>
            </div>
        </div>
    )
}
