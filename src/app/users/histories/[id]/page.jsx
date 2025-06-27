"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import HistoryService from "../../../../services/HistoryService";
import ExamDetailPanel from "../../../../components/exam/ExamDetailPanel";
import { toast } from "sonner";
import mergedQuestions from "../../../../util/mergeQuestion";

export default function HistoryDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await HistoryService.getHistoryDetail(id);
                setData(mergedQuestions(response));
            } catch (error) {
                toast.error("Lỗi khi lấy chi tiết bài làm");
                router.push("/users/histories");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, router]);

    if (loading || !data) return <p className="p-6">Đang tải chi tiết bài làm...</p>;

    return (
        <ExamDetailPanel data={data} onClose={() => router.push("/users/histories")} />
    );
}