"use client";

import {motion} from "framer-motion";
import {useParams, useRouter} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import RoomService from "../../../../../services/RoomService";
import {Copy, LinkIcon, Loader2, QrCode, Users, X} from "lucide-react";
import {toast} from "sonner";
import {Button} from "../../../../../components/ui/button";
import ConfirmDialog from "../../../../../components/alerts-confirms/ConfirmDialog";
import createExamSocket from "../../../../../config/socketConfig";
import {backendBaseUrl} from "../../../../../config/backendBaseUrl";

export default function WaitingRoom() {
    const {code} = useParams();
    const router = useRouter();

    const [authorName, setAuthorName] = useState("");
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [examTitle, setExamTitle] = useState("");
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const isStartedRef = useRef(false);

    const [loading, setLoading] = useState(true);
    const [hostEmail, setHostEmail] = useState("");

    const socketRef = useRef(null);
    const cleanupRef = useRef(null);
    const storedEmail = localStorage.getItem("email");

    const fetchRoomData = async () => {
        try {
            const response = await RoomService.join(code);
            setExamTitle(response.data.examTitle);
            setAuthorName(response.data.authorName);
            setHostEmail(response.data.hostEmail);
        } catch (error) {
            if (error.response?.status === 409 || error.response?.status === 404) {
                toast.error(error.response.data + ", trở về trang chủ...");
                setTimeout(() => router.push("/users/dashboard"), 2000);
            } else {
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!code || !storedEmail) return;
        fetchRoomData();
    }, [code]);

    useEffect(() => {
        if (!hostEmail || !storedEmail || !code) return;
        const isHost = hostEmail === storedEmail;
        const {socket, cleanup} = createExamSocket({
            code,
            onStart: () => {
                isStartedRef.current = true;
                setIsTransitioning(true);
                setTimeout(() => {
                    router.push(`/users/exams/online/${code}/play`);
                }, 500);
            },
            onJoin: ({username, email, candidates}) => {
                if (isHost && email !== hostEmail) {
                    toast.success(`${username} đã vào phòng`);
                }
                setCandidates(candidates);
            },
            onLeave: ({username, email, candidates}) => {
                if (isHost && !isStartedRef.current) {
                    toast.error(`${username} đã rời phòng`);
                }
                setCandidates(candidates);
            },
            isHost
        });
        socketRef.current = socket;
        cleanupRef.current = cleanup;

        return () => {
            cleanup();
        };
    }, [hostEmail, storedEmail, code]);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleStartExam = async () => {
        try {
            await RoomService.start(code);
            const expectCount = candidates.length;
            socketRef.current?.send(`START:${code}:${expectCount}`);
        } catch (error) {
            toast.error(error.response?.data || "Lỗi khi bắt đầu bài thi");
        }
    };

    const handleLeaveRoom = async () => {
        setLoading(true);
        try {
            await RoomService.leave(code);
            router.push("/users/dashboard");
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-purple-900">
                <Loader2 className="h-8 w-8 animate-spin text-white"/>
            </div>
        );
    }

    return (
        <>
            {isTransitioning ? (
                <div className="flex items-center justify-center h-screen w-screen bg-black">
                    <Loader2 className="h-10 w-10 animate-spin text-white"/>
                </div>
            ) : (
                <div className="flex h-screen bg-black text-white relative">
                    <ConfirmDialog
                        trigger={
                            <Button
                                variant="outline"
                                className="absolute top-4 right-4 z-10 px-3 py-1 text-sm flex items-center gap-1 cursor-pointer hover:bg-gray-500"
                            >
                                <X className="w-4 h-4"/> Thoát
                            </Button>}
                        title="Bạn có chắc muốn rời phòng?"
                        description="Bạn sẽ bị đưa trở về bảng điều khiển. Nếu bạn là chủ phòng, những người khác vẫn sẽ ở lại phòng chờ."
                        cancelLabel="Hủy"
                        actionLabel="Rời phòng"
                        onConfirm={handleLeaveRoom}
                        actionClass="bg-red-600 hover:bg-red-700 text-white"
                        cancelClass="bg-gray-100 hover:bg-gray-200 text-gray-800 border-0"
                    />
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
                            <motion.p
                                className="text-sm font-semibold text-gray-400"
                                animate={{opacity: [1, 0.5, 1]}}
                                transition={{duration: 2, repeat: Infinity}}
                            >
                                Xin đợi các thí sinh khác cùng tham gia...
                            </motion.p>
                            {hostEmail === storedEmail && (
                                <Button
                                    className="w-full h-12 bg-purple-600 hover:bg-purple-700 cursor-pointer text-white text-lg font-semibold"
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
                                    <Button size="icon" variant="outline" className="h-12 w-12 cursor-pointer"
                                            onClick={handleCopyLink}>
                                        {copiedLink ? (
                                            <span className="text-green-500 font-bold">✓</span>
                                        ) : (
                                            <LinkIcon className="w-5 h-5"/>
                                        )}
                                    </Button>

                                    <Button size="icon" variant="outline" className="h-12 w-12 cursor-pointer"
                                            onClick={handleCopyCode}>
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
                                Danh sách thí sinh ({candidates?.length})
                            </h2>

                            <div className="space-y-1">
                                {candidates?.map((item, index) => (
                                    <div key={index}
                                         className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded text-sm text-white">
                                        <img
                                            src={`${backendBaseUrl}${item.avatar}`}
                                            alt={item.username}
                                            className="w-6 h-6 rounded-full object-cover border border-white"
                                        />
                                        <span>{item.username}</span>
                                    </div>
                                ))}
                                {!candidates && (
                                    <div className="text-sm text-gray-400 italic">Chưa có thí sinh nào...</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

