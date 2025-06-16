import {AppHeader} from "../../components/AppHeader";
import {AppSidebar} from "../../components/AppSidebar";


export default function Page() {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <AppSidebar />

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                <AppHeader />

                <main className="flex-1 p-6">
                    <div className="text-center py-20">
                        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Hôm nay bạn dạy gì?</h1>
                        <p className="text-gray-600">Nội dung chính sẽ được thêm vào đây...</p>
                    </div>
                </main>
            </div>
        </div>
    )
}
