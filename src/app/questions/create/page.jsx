"use client"

import {useState, useEffect} from "react"
import {useFormik} from "formik"
import * as Yup from "yup"

import {Button} from "../../../components/ui/button"
import {Card} from "../../../components/ui/card"
import {Textarea} from "../../../components/ui/textarea"
import {Input} from "../../../components/ui/input"
import {Send, Loader2} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select"
import {RadioGroup, RadioGroupItem} from "../../../components/ui/radio-group"
import {Checkbox} from "../../../components/ui/checkbox"

import QuestionService from "../../../services/QuestionService"
import CategoryService from "../../../services/CategoryService"
import TypeService from "../../../services/TypeService"
import DifficultyService from "../../../services/DifficultyService"
import {initialAnswers} from "../../../initvalues/answer"
import {cn} from "../../../lib/utils";
import { toast } from "sonner";


export default function CreateForm() {
    const [categories, setCategories] = useState([])
    const [types, setTypes] = useState([])
    const [difficulties, setDifficulties] = useState([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchDropdowns = async () => {
        try {
            const [catRes, typeRes, diffRes] = await Promise.all([
                CategoryService.getAll(),
                TypeService.getAll(),
                DifficultyService.getAll(),
            ])
            setCategories(catRes.data)
            setTypes(typeRes.data)
            setDifficulties(diffRes.data)
        } catch (err) {
            console.error("Error fetching dropdowns:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDropdowns()
    }, [])

    const formik = useFormik({
        initialValues: {
            category: "",
            type: "",
            difficulty: "",
            content: "",
            answers: initialAnswers("single"),
        },
        validationSchema: Yup.object().shape({
            category: Yup.string().required("Category is required"),
            type: Yup.string().required("Type is required"),
            difficulty: Yup.string().required("Difficulty is required"),
            content: Yup.string().required("Question content is required"),
            answers: Yup.array()
                .of(
                    Yup.object().shape({
                        id: Yup.number().required(),
                        content: Yup.string().trim().required("Answer is required"),
                        correct: Yup.boolean(),
                    })
                )
                .test(
                    "validCorrectAnswers",
                    "Invalid number of correct answers",
                    function (answers) {
                        const type = this.parent.type
                        const correctCount = answers.filter((a) => a.correct).length
                        if (type === "multiple") return correctCount >= 2
                        return correctCount === 1 // for "single" or "boolean"
                    }
                ),
        }),
    })

    const handleSubmit = async () => {
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            toast.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        const cleanedAnswers = formik.values.answers.map(({ content, correct }) => ({
            content,
            correct,
        }));

        const payload = {
            ...formik.values,
            answers: cleanedAnswers,
        };

        try {
            setIsSubmitting(true);
            await QuestionService.create(payload);
            toast.success("Tạo câu hỏi thành công! 🎉");
            formik.resetForm();
        } catch (err) {
            toast.error("Đã xảy ra lỗi khi tạo câu hỏi. Vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const currentType = formik.values.type
        if (currentType) {
            formik.setFieldValue("answers", initialAnswers(currentType))
        }
    }, [formik.values.type])

    const handleSelectChange = (field) => (value) => {
        formik.setFieldValue(field, value)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-purple-900">
                <Loader2 className="h-8 w-8 animate-spin text-white"/>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Dropdowns */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <Select value={formik.values.category} onValueChange={handleSelectChange("category")}>
                        <SelectTrigger className="w-[200px] bg-white/20 text-white border-white/20 font-medium tracking-wide text-sm">

                            <SelectValue placeholder="Select Category"/>
                        </SelectTrigger>
                        <SelectContent className="bg-purple-900 text-white border-white/20 text-sm font-medium tracking-wide">

                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.name}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={formik.values.difficulty} onValueChange={handleSelectChange("difficulty")}>
                        <SelectTrigger className="w-[200px] bg-white/20 text-white border-white/20 font-medium tracking-wide text-sm">

                            <SelectValue placeholder="Select Difficulty"/>
                        </SelectTrigger>
                        <SelectContent className="bg-purple-900 text-white border-white/20 text-sm font-medium tracking-wide">

                            {difficulties.map((diff) => (
                                <SelectItem key={diff.id} value={diff.name}>
                                    {diff.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={formik.values.type} onValueChange={handleSelectChange("type")}>
                        <SelectTrigger className="w-[200px] bg-white/20 text-white border-white/20 font-medium tracking-wide text-sm">

                            <SelectValue placeholder="Select Type"/>
                        </SelectTrigger>
                        <SelectContent className="bg-purple-900 text-white border-white/20 text-sm font-medium tracking-wide">

                            {types.map((type) => (
                                <SelectItem key={type.id} value={type.name}>
                                    {type.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Question Content */}
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-8 p-8">
                    <Textarea
                        name="content"
                        placeholder="Type your question here"
                        value={formik.values.content}
                        onChange={formik.handleChange}
                        className="bg-transparent border-none text-white placeholder:text-white/60 text-xl leading-relaxed tracking-wide font-medium resize-none min-h-[100px] focus:ring-0 focus:outline-none"
                    />

                </Card>

                {/* Answer Options */}
                <div
                    className={`grid gap-4 mb-8 ${
                        formik.values.answers.length === 2
                            ? "grid-cols-1 md:grid-cols-2"
                            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                    }`}
                >
                    {formik.values.answers.map((answer, index) => (
                        <Card
                            key={answer.id}
                            className={`bg-gradient-to-br ${answer.color} border-none h-80 relative overflow-hidden`}
                        >
                            <div className="absolute top-4 right-4">
                                {formik.values.type === "multiple" ? (
                                    <Checkbox
                                        checked={answer.correct}
                                        onCheckedChange={(checked) => {
                                            const updatedAnswers = [...formik.values.answers]
                                            updatedAnswers[index].correct = checked
                                            formik.setFieldValue("answers", updatedAnswers)
                                        }}
                                        className="w-5 h-5 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-purple-900"
                                    />
                                ) : (
                                    <RadioGroup
                                        value={formik.values.answers.find((a) => a.correct)?.id.toString()}
                                        onValueChange={(val) => {
                                            const updatedAnswers = formik.values.answers.map((a) => ({
                                                ...a,
                                                correct: a.id.toString() === val,
                                            }))
                                            formik.setFieldValue("answers", updatedAnswers)
                                        }}
                                    >
                                        <RadioGroupItem
                                            value={answer.id.toString()}
                                            id={`answer-${answer.id}`}
                                            checked={formik.values.answers.some((a) => a.id === answer.id && a.correct)}
                                            onChange={() => {
                                                const updatedAnswers = formik.values.answers.map((a) =>
                                                    a.id === answer.id ? {...a, correct: true} : {...a, correct: false}
                                                );
                                                formik.setFieldValue("answers", updatedAnswers);
                                            }}
                                            className={cn(
                                                "w-6 h-6 rounded-full border-2 border-white/40 text-white relative transition-colors",
                                                "data-[state=checked]:bg-white data-[state=checked]:border-white",
                                                "after:content-['✓'] after:absolute after:text-purple-900 after:font-bold after:text-sm",
                                                "after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2",
                                                "data-[state=unchecked]:after:content-none"
                                            )}
                                        />
                                    </RadioGroup>
                                )}
                            </div>

                            {/* Answer Input */}
                            <div className="p-4 h-full flex flex-col justify-center">
                                <label htmlFor={`answer-${answer.id}`} className="sr-only">
                                    Answer {index + 1}
                                </label>
                                <Input
                                    id={`answer-${answer.id}`}
                                    value={answer.content}
                                    onChange={(e) => {
                                        const updatedAnswers = [...formik.values.answers];
                                        updatedAnswers[index].content = e.target.value;
                                        formik.setFieldValue("answers", updatedAnswers);
                                    }}
                                    placeholder={`Answer Option ${index + 1}`}
                                    className="bg-transparent border-none text-white placeholder:text-white/60 text-base leading-relaxed tracking-wide font-medium focus:ring-0 focus:outline-none h-full"
                                />

                            </div>
                        </Card>
                    ))}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-8 text-base font-semibold tracking-wide"
                    >

                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                Submitting
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4"/>
                                Submit Question
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}


