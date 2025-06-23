'use client'

import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import RoomService from "../../../../../services/RoomService";
import {Copy, LinkIcon, Loader2, QrCode, Users, X} from "lucide-react";
import connectRoomSocket from "../../../../../config/socketConfig";
import {toast} from "sonner";
import {Button} from "../../../../../components/ui/button";
import ConfirmDialog from "../../../../../components/alerts-confirms/ConfirmDialog";

export default function WaitingRoom() {
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const {code} = useParams();
    const router = useRouter();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hostName, setHostName] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [examTitle, setExamTitle] = useState("");
    const currentUsername = localStorage.getItem("username");
    const isHost = currentUsername === hostName;

    useEffect(() => {
        let socket;
        const fetchAndConnect = async () => {
            try {
                const response = await RoomService.join(code);
                setCandidates(response.data.candidateNames);
                setHostName(response.data.hostName);
                setExamTitle(response.data.examTitle);
                setAuthorName(response.data.authorName);
                socket = connectRoomSocket({
                    code,
                    onJoin: (username) => {
                        setCandidates((prev) => [...new Set([...prev, username])]);
                        const message = username === currentUsername ? "Đã vào phòng" : username + " đã vào phòng";
                        toast.success(message);
                    },
                    onLeave: (username) => {
                        setCandidates((prev) => prev.filter((name) => name !== username));
                        const message = username === currentUsername ? "Đã rời phòng" : username + " đã rời phòng";
                        toast.error(message);
                    },
                    onStarted: (examId) => {
                        router.push(`/users/exams/${examId}/play`);
                    }
                });
            } catch (error) {
                if (error.response?.status === 409 || error.response?.status === 404) {
                    toast.error(error.response.data + ", đang trở về trang chủ...");
                    setTimeout(() => {
                        router.push("/users/dashboard");
                    }, 2000);
                }
                console.error("Join room failed:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAndConnect();
        return () => {
            if (socket) socket.close();
        };
    }, [code]);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleStartExam = async () => {
        setLoading(true);
        try {
            await RoomService.start(code);
        } catch (error) {
            toast.error(error.response.data);
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveRoom = async () => {
        await RoomService.leave(code)
        router.push("/users/dashboard");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-purple-900">
                <Loader2 className="h-8 w-8 animate-spin text-white"/>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-black text-white relative">
            {/* Nút Thoát */}
            <Button
                variant="outline"
                className="absolute top-4 right-4 z-10 px-3 py-1 text-sm flex items-center gap-1"
                onClick={() => setConfirmDialogOpen(true)}
            >
                <X className="w-4 h-4"/> Thoát
            </Button>

            {/* Left: Slide preview */}
            <div className="flex-1 flex items-center justify-center bg-white rounded-r-3xl">
                <div className="text-center space-y-8">
                    <h1 className="text-5xl font-bold text-purple-800">{examTitle}</h1>
                    <p className="text-sm text-gray-500">Tác giả - {authorName}</p>
                    <div className="border-t-4 border-purple-600 w-40 mx-auto"></div>
                </div>
            </div>

            {/* Right: Room Info */}
            <div className="w-[400px] bg-gray-900 p-6 space-y-6 flex flex-col">
                <div className="space-y-4">
                    <p className="text-sm font-semibold text-gray-400">Mã phòng</p>
                    <div className="text-4xl font-bold tracking-widest">{code}</div>
                    <h1 className="text-xl font-bold text-white">Chủ phòng - {hostName}</h1>
                    <p className="text-sm font-semibold text-gray-400">Xin đợi các thí sinh khác cùng tham gia.....</p>

                    {isHost && (
                        <Button
                            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold"
                            onClick={handleStartExam}
                            disabled={loading}
                        >
                            {loading ? "ĐANG TẢI" : "BẮT ĐẦU"}
                        </Button>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="w-20 h-20 bg-white rounded p-2 flex items-center justify-center">
                            <QrCode className="w-14 h-14 text-black"/>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                size="icon"
                                variant="outline"
                                className="h-12 w-12"
                                onClick={handleCopyLink}
                            >
                                {copiedLink ? (
                                    <span className="text-green-500 font-bold">✓</span>
                                ) : (
                                    <LinkIcon className="w-5 h-5"/>
                                )}
                            </Button>

                            <Button
                                size="icon"
                                variant="outline"
                                className="h-12 w-12"
                                onClick={handleCopyCode}
                            >
                                {copiedCode ? (
                                    <span className="text-green-500 font-bold">✓</span>
                                ) : (
                                    <Copy className="w-5 h-5"/>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Participants List */}
                <div className="flex-1 overflow-y-auto">
                    <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Users className="w-5 h-5"/>
                        Danh sách thí sinh ({candidates.length})
                    </h2>

                    <div className="space-y-1">
                        {candidates.map((name, index) => (
                            <div key={index} className="bg-gray-800 px-3 py-2 rounded text-sm">
                                {name}
                            </div>
                        ))}

                        {candidates.length === 0 && (
                            <div className="text-sm text-gray-400 italic">Chưa có thí sinh nào...</div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={confirmDialogOpen}
                setOpen={setConfirmDialogOpen}
                title="Bạn có chắc muốn rời phòng?"
                description="Bạn sẽ bị đưa trở về bảng điều khiển. Nếu bạn là chủ phòng, những người khác vẫn sẽ ở lại phòng chờ."
                cancelLabel="Hủy"
                actionLabel="Rời phòng"
                onConfirm={() => handleLeaveRoom()}
                actionClass="bg-red-600 hover:bg-red-700 text-white"
                cancelClass="bg-gray-100 hover:bg-gray-200 text-gray-800 border-0"
            />
        </div>
    );
}
