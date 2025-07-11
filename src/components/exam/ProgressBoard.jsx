"use client";

import {CheckCircle, Clock, Users, X} from "lucide-react";
import {config} from "../../config/url.config";
import {defaultAvatar} from "../../config/backendBaseUrl";

export default function ProgressBoard({candidates = [], submittedUsers = [], onKick}) {
    const total = candidates.length;
    const submitted = submittedUsers.length;

    const hasSubmitted = (email) =>
        submittedUsers.some((user) => user.email === email);

    return (
        <div className="w-full max-w-xl bg-purple-900 p-6 rounded-xl shadow-lg space-y-6 text-white">
            <div className="space-y-1">
                <h2 className="text-lg font-bold flex items-center gap-2 text-purple-200">
                    <Users className="w-5 h-5 text-white"/>
                    Theo dõi tiến độ
                </h2>
                <p className="text-sm text-purple-300 ml-1">
                    Đã nộp bài: <span className="font-semibold text-white">{submitted}</span> / {total}
                </p>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                {candidates.map((item, idx) => {
                    const isSubmitted = hasSubmitted(item.email);
                    return (
                        <div
                            key={idx}
                            className={`flex items-center justify-between px-4 py-2 rounded-lg text-sm ${
                                isSubmitted ? "bg-emerald-600/80" : "bg-purple-800"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <img
                                    src={item.avatar ? `${config.apiBaseUrl}${item.avatar}` : `${config.apiBaseUrl}${defaultAvatar}`}
                                    alt={item.username}
                                    className="w-6 h-6 rounded-full object-cover border border-white/20"
                                />
                                <span>{item.username}</span>
                            </div>
                            <span className="flex items-center gap-1 text-xs">
                                {isSubmitted ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 text-green-300"/>
                                        <span className="text-white">Đã nộp</span>
                                    </>
                                ) : (
                                    <>
                                        <Clock className="w-4 h-4 text-yellow-400 animate-pulse"/>
                                        <span className="text-yellow-100">Đang làm</span>
                                    </>
                                )}
                                <button
                                    className="ml-2 rounded-full bg-red-500 text-white hover:bg-red-700 text-white cursor-pointer transition-all decoration-200"
                                    title="Kick khỏi phòng"
                                    onClick={() => onKick(item.email)}
                                >
                                                <X className="w-4 h-4"/>
                                </button>
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
