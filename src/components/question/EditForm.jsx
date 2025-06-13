import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import CategoryService from "../../services/CategoryService";
import DifficultyService from "../../services/DifficultyService";
import TypeService from "../../services/TypeService";
import QuestionService from "../../services/QuestionService";
import {useParams} from "next/navigation";

const EditQuestionForm = ({ onSuccess }) => {
    const questionId = useParams().id; // Lấy ID từ URL
    const [initialValues, setInitialValues] = useState(null);
    const [categories, setCategories] = useState([]);
    const [difficulties, setDifficulties] = useState([]);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitStatus, setSubmitStatus] = useState(null);

    const validationSchema = Yup.object().shape({
        content: Yup.string().required("Vui lòng nhập nội dung câu hỏi"),
        category: Yup.string().required("Vui lòng chọn danh mục"),
        difficulty: Yup.string().required("Vui lòng chọn độ khó"),
        type: Yup.string().required("Vui lòng chọn loại câu hỏi"),
    });

    // Fetch question + dropdowns
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [questionRes, catRes, diffRes, typeRes] = await Promise.all([
                    QuestionService.getById(questionId),
                    CategoryService.getAll(),
                    DifficultyService.getAll(),
                    TypeService.getAll(),
                ]);

                const questionData = questionRes.data;

                setInitialValues({
                    content: questionData.content || "",
                    category: questionData.category || "",
                    difficulty: questionData.difficulty || "",
                    type: questionData.type || "",
                });

                setCategories(catRes.data || []);
                setDifficulties(diffRes.data || []);
                setTypes(typeRes.data || []);
            } catch (err) {
                console.error("Lỗi khi load dữ liệu:", err);
                setSubmitStatus("Lỗi khi tải dữ liệu câu hỏi hoặc dropdown.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [questionId]);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            await QuestionService.update(questionId, values);
            setSubmitStatus("Cập nhật thành công!");
            if (onSuccess) onSuccess(); // callback nếu có
        } catch (error) {
            console.error(error);
            setSubmitStatus("Cập nhật thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !initialValues) return <div>Đang tải dữ liệu...</div>;

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
            <h2 className="text-lg font-bold mb-4">Chỉnh sửa câu hỏi</h2>

            {submitStatus && (
                <div className="text-sm text-center mb-4 text-green-700">{submitStatus}</div>
            )}

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                <Form className="space-y-4">
                    <div>
                        <label className="block font-medium">Nội dung câu hỏi</label>
                        <Field
                            as="textarea"
                            name="content"
                            rows="3"
                            className="w-full border p-2 rounded"
                        />
                        <ErrorMessage
                            name="content"
                            component="div"
                            className="text-sm text-red-600"
                        />
                    </div>

                    <div>
                        <label className="block font-medium">Danh mục</label>
                        <Field
                            as="select"
                            name="category"
                            className="w-full border p-2 rounded"
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </Field>
                        <ErrorMessage
                            name="category"
                            component="div"
                            className="text-sm text-red-600"
                        />
                    </div>

                    <div>
                        <label className="block font-medium">Độ khó</label>
                        <Field
                            as="select"
                            name="difficulty"
                            className="w-full border p-2 rounded"
                        >
                            <option value="">-- Chọn độ khó --</option>
                            {difficulties.map((d) => (
                                <option key={d.id} value={d.name}>
                                    {d.name}
                                </option>
                            ))}
                        </Field>
                        <ErrorMessage
                            name="difficulty"
                            component="div"
                            className="text-sm text-red-600"
                        />
                    </div>

                    <div>
                        <label className="block font-medium">Loại câu hỏi</label>
                        <Field
                            as="select"
                            name="type"
                            className="w-full border p-2 rounded"
                        >
                            <option value="">-- Chọn loại --</option>
                            {types.map((t) => (
                                <option key={t.id} value={t.name}>
                                    {t.name}
                                </option>
                            ))}
                        </Field>
                        <ErrorMessage
                            name="type"
                            component="div"
                            className="text-sm text-red-600"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Cập nhật
                    </button>
                </Form>
            </Formik>
        </div>
    );
};

export default EditQuestionForm;
