'use client';

import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useParams } from 'next/navigation'; // hoặc từ react-router nếu dùng route khác

import CategoryService from '../../../../services/CategoryService';
import TypeService from '../../../../services/TypeService';
import DifficultyService from '../../../../services/DifficultyService';
import QuestionService from '../../../../services/QuestionService';

export default function EditQuestionForm() {
    const [serverError, setServerError] = useState('');

    const { id } = useParams(); // Lấy id từ route: /questions/edit/:id
    const [categories, setCategories] = useState([]);
    const [types, setTypes] = useState([]);
    const [difficulties, setDifficulties] = useState([]);
    const [loading, setLoading] = useState(true);

    const [initialValues, setInitialValues] = useState({
        category: '',
        type: '',
        difficulty: '',
        content: '',
        answers: ['', '', '', ''],
        correctAnswers: [],
    });

    const fetchDropdowns = async () => {
        try {
            const [catRes, typeRes, diffRes] = await Promise.all([
                CategoryService.getAll(),
                TypeService.getAll(),
                DifficultyService.getAll(),
            ]);
            setCategories(catRes.data);
            setTypes(typeRes.data);
            setDifficulties(diffRes.data);
        } catch (err) {
            console.error('Lỗi khi load dropdown:', err);
        }
    };

    const fetchQuestion = async () => {
        try {
            const res = await QuestionService.getById(id);
            const q = res.data;

            setInitialValues({
                category: q.category,
                type: q.type,
                difficulty: q.difficulty,
                content: q.content,
                answers: q.answers.map((a) => a.content),
                correctAnswers: q.answers
                    .map((a, idx) => (a.correct ? idx.toString() : null))
                    .filter((v) => v !== null),
            });
        } catch (err) {
            console.error('Lỗi khi lấy câu hỏi:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDropdowns();
        fetchQuestion();
    }, []);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema: Yup.object({
            category: Yup.string().required('Category is required'),
            type: Yup.string().required('Type is required'),
            difficulty: Yup.string().required('Difficulty is required'),
            content: Yup.string().required('Content is required'),
            answers: Yup.array()
                .of(Yup.string().required('Answer cannot be empty'))
                .test(
                    'minAnswers',
                    'At least 2 answers required',
                    (val, ctx) => ctx.parent.type === 'multiple' ? val.filter(Boolean).length >= 2 : true
                ),
            correctAnswers: Yup.array()
                .test('atLeastOne', 'Select at least one correct answer', (val, ctx) => {
                    if (ctx.parent.type === 'multiple') return val.length >= 2;
                    if (ctx.parent.type === 'boolean' || ctx.parent.type === 'single') return val.length === 1;
                    return true;
                })
        }),
        onSubmit: async (values) => {
            const payload = {
                category: values.category,
                type: values.type,
                difficulty: values.difficulty,
                content: values.content,
                answers: values.answers.map((ans, index) => ({
                    content: ans,
                    correct: values.correctAnswers.includes(index.toString())
                }))
            };
            try {
                setServerError(''); // clear lỗi cũ
                await QuestionService.update(id, payload);
                alert('Cập nhật câu hỏi thành công!');
            } catch (err) {
                if (err.response?.status === 409) {
                    setServerError(err.response.data);
                } else {
                    setServerError('Lỗi không xác định khi cập nhật câu hỏi.');
                }
            }
        }

    });

    const renderAnswerInputs = () => {
        const isBoolean = formik.values.type === 'boolean';
        const isMultiple = formik.values.type === 'multiple';
        const count = isBoolean ? 2 : 4;

        return Array.from({ length: count }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
                {isMultiple ? (
                    <input
                        type="checkbox"
                        name="correctAnswers"
                        value={idx.toString()}
                        checked={formik.values.correctAnswers.includes(idx.toString())}
                        onChange={formik.handleChange}
                    />
                ) : (
                    <input
                        type="radio"
                        name="correctAnswers"
                        value={idx.toString()}
                        checked={formik.values.correctAnswers[0] === idx.toString()}
                        onChange={(e) => formik.setFieldValue('correctAnswers', [e.target.value])}
                    />
                )}
                <input
                    type="text"
                    name={`answers[${idx}]`}
                    value={formik.values.answers[idx] || ''}
                    onChange={formik.handleChange}
                    placeholder={`Answer ${idx + 1}`}
                    className="border px-2 py-1 rounded w-full"
                />
            </div>
        ));
    };

    if (loading) return <div>Đang tải dữ liệu...</div>;

    return (
        <form onSubmit={formik.handleSubmit} className="max-w-xl mx-auto p-4 space-y-4">
            <h2 className="text-xl font-bold">Chỉnh sửa câu hỏi</h2>

            <div>
                <label>Question Content</label>
                <textarea
                    name="content"
                    value={formik.values.content}
                    onChange={formik.handleChange}
                    className="w-full border px-3 py-2 rounded"
                />
                {formik.errors.content && <div className="text-red-500 text-sm">{formik.errors.content}</div>}
            </div>

            <div>
                <label>Category</label>
                <select
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    className="w-full border px-3 py-2 rounded"
                >
                    <option value="">Chọn chuyên mục</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
                {formik.errors.category && <div className="text-red-500 text-sm">{formik.errors.category}</div>}
            </div>

            <div>
                <label>Type</label>
                <select
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    className="w-full border px-3 py-2 rounded"
                >
                    <option value="">Chọn dạng</option>
                    {types.map((type) => (
                        <option key={type.id} value={type.name}>{type.name}</option>
                    ))}
                </select>
                {formik.errors.type && <div className="text-red-500 text-sm">{formik.errors.type}</div>}
            </div>

            <div>
                <label>Difficulty</label>
                <select
                    name="difficulty"
                    value={formik.values.difficulty}
                    onChange={formik.handleChange}
                    className="w-full border px-3 py-2 rounded"
                >
                    <option value="">Chọn độ khó</option>
                    {difficulties.map((diff) => (
                        <option key={diff.id} value={diff.name}>{diff.name}</option>
                    ))}
                </select>
                {formik.errors.difficulty && <div className="text-red-500 text-sm">{formik.errors.difficulty}</div>}
            </div>

            <div>
                <label>Answers</label>
                {renderAnswerInputs()}
                {formik.errors.answers && <div className="text-red-500 text-sm">{formik.errors.answers}</div>}
                {formik.errors.correctAnswers && <div className="text-red-500 text-sm">{formik.errors.correctAnswers}</div>}
            </div>
            {serverError && (
                <div className="text-red-600 font-semibold bg-red-100 p-2 rounded">
                    {serverError}
                </div>
            )}

            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                Lưu thay đổi
            </button>
        </form>
    );
}
