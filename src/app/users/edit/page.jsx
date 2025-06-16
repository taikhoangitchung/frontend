'use client';

import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import UserService from '../../../services/UserService';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';

const EditProfile = () => {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [initialUsername, setInitialUsername] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUserEmail = localStorage.getItem('currentUserEmail');
            if (!storedUserEmail) {
                router.push('/login');
                return;
            }
            setUserEmail(storedUserEmail);
            const storedUsername = localStorage.getItem('currentUserUsername') || '';
            const defaultAvatar = 'http://localhost:8080/media/default-avatar.png';
            setInitialUsername(storedUsername);
            setAvatarPreview(defaultAvatar);

            UserService.getProfile(storedUserEmail)
                .then(response => {
                    const user = response.data;
                    const username = user.username || storedUsername;
                    const avatar = user.avatar || defaultAvatar;
                    setInitialUsername(username);
                    setAvatarPreview(`http://localhost:8080${avatar}`);
                    localStorage.setItem('currentUserUsername', username);
                    localStorage.setItem('currentUserAvatar', avatar);
                })
                .catch(err => {
                    console.error('Lỗi khi lấy thông tin user:', err);
                    setAvatarPreview(defaultAvatar);
                })
                .finally(() => setLoading(false));
        }
    }, [router]);

    const validationSchema = Yup.object({
        username: Yup.string()
            .max(50, 'Tên hiển thị không được vượt quá 50 ký tự'),
        avatar: Yup.mixed()
            .test('fileSize', 'File quá lớn', (value) => !value || value.size <= 5 * 1024 * 1024)
            .test('fileType', 'Chỉ hỗ trợ file ảnh', (value) => !value || ['image/jpeg', 'image/png', 'image/gif'].includes(value.type)),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const formData = new FormData();
            formData.append('email', userEmail);
            if (values.username) formData.append('username', values.username);
            if (values.avatar) formData.append('avatar', values.avatar);

            const response = await UserService.editProfile(formData);
            toast.success(response.data, { autoClose: 1500 });
            if (values.avatar) {
                const newAvatar = response.data.avatar || avatarPreview;
                setAvatarPreview(newAvatar);
                localStorage.setItem('currentUserAvatar', newAvatar);
            }
            if (values.username) {
                localStorage.setItem('currentUserUsername', values.username);
            }
            setTimeout(() => router.push('/'), 1500);
        } catch (err) {
            const errorMsg = err.response?.data || 'Cập nhật không thành công. Vui lòng kiểm tra lại file upload hoặc kết nối backend.';
            toast.error(errorMsg, { autoClose: 3000 });
            console.error('Lỗi submit:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/');
    };

    const handleAvatarChange = (event, setFieldValue) => {
        const file = event.currentTarget.files[0];
        if (file) {
            setFieldValue('avatar', file);
            const reader = new FileReader();
            reader.onload = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    if (loading || !userEmail) {
        return <div>Đang tải...</div>;
    }

    return (
        <div>
            <h2>Cập nhật thông tin tài khoản</h2>
            <Formik
                initialValues={{ username: initialUsername, avatar: null }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, setFieldValue }) => (
                    <Form>
                        <div>
                            <label>Email <span style={{ color: 'red' }}>*</span></label>
                            <p>{userEmail}</p>
                        </div>
                        <div>
                            <label>Tên hiển thị</label>
                            <Field
                                type="text"
                                name="username"
                                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                            />
                            <ErrorMessage name="username" component="p" className="error" />
                        </div>
                        <div>
                            <label>Avatar</label>
                            {avatarPreview && (
                                <img src={avatarPreview} alt="Avatar" style={{ width: '100px', height: '100px', marginBottom: '10px' }} />
                            )}
                            <input
                                type="file"
                                name="avatar"
                                accept="image/*"
                                onChange={(event) => handleAvatarChange(event, setFieldValue)}
                                style={{ marginBottom: '10px' }}
                            />
                            <ErrorMessage name="avatar" component="p" className="error" />
                        </div>
                        <button type="submit" disabled={isSubmitting}>
                            Cập nhật
                        </button>
                        <button type="button" onClick={handleCancel} style={{ marginLeft: '10px', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc' }}>
                            Hủy
                        </button>
                    </Form>
                )}
            </Formik>
            <ToastContainer
                position="top-right"
                autoClose={1500}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                closeButton={false}
            />
        </div>
    );
};

export default EditProfile;