"use client"

import {Card, CardContent, CardHeader} from "../../../../components/ui/card";
import {Button} from "../../../../components/ui/button";
import {X, Check, Loader2, ArrowLeft} from "lucide-react";
import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import ExamService from "../../../../services/ExamService";

export default function Page() {
    const router = useRouter();
    const {id} = useParams();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await ExamService.getToPlayById(id);
                console.log(response);
                setQuestions(response.data.questions);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-purple-900">
                <Loader2 className="h-8 w-8 animate-spin text-white"/>
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8">
            <div className="max-w-5xl mx-auto space-y-4">
                {/* Nút quay về */}
                <div className="flex justify-start mb-2">
                    <Button
                        onClick={() => router.back()}
                        className="bg-gray-700 hover:bg-gray-600 text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2"/>
                        Quay lại
                    </Button>
                </div>

                {/* Danh sách có scroll nếu dài */}
                <div className="h-[75vh] overflow-y-auto space-y-4 pr-1">
                    {questions.map((question, index) => (
                        <Card
                            key={question.id}
                            className="border border-gray-200 text-sm"
                        >
                            <CardHeader className="pb-1">
                                <h2 className="text-base sm:text-lg font-semibold text-purple-800">
                                    {index + 1}. {question.content}
                                </h2>
                            </CardHeader>

                            <CardContent className="space-y-2 mt-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {question.answers.map((answer) => (
                                        <div
                                            key={answer.id}
                                            className={`flex items-center gap-2 p-2 rounded-lg border ${
                                                answer.correct
                                                    ? "bg-green-50 border-green-200"
                                                    : "bg-red-50 border-red-200"
                                            }`}
                                        >
                                            {answer.correct ? (
                                                <Check className="w-4 h-4 text-green-600"/>
                                            ) : (
                                                <X className="w-4 h-4 text-red-400 opacity-50"/>
                                            )}
                                            <span>{answer.content}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
