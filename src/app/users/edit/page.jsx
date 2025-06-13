'use client';

import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';

const EditProfile = () => {
    const router = useRouter();
    const [currentEmail, setCurrentEmail] = useState('');
    const [avatarPreview, setAvatarPreview] = useState('');
    const [initialUsername, setInitialUsername] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const email = localStorage.getItem('currentUserEmail');
            if (!email) {
                router.push('/login');
                return;
            }
            setCurrentEmail(email);
            // Gán giá trị mặc định từ localStorage hoặc API
            const storedUsername = localStorage.getItem('currentUserUsername') || '';
            const storedAvatarName = localStorage.getItem('currentUserAvatar') || 'default-avatar.png';
            const defaultAvatar = 'http://localhost:8080/media/default-avatar.png';
            setInitialUsername(storedUsername);
            setAvatarPreview(defaultAvatar); // Sử dụng mặc định ban đầu
            // Gọi API để lấy thông tin theo email
            axios.get(`http://localhost:8080/users/profile?email=${encodeURIComponent(email)}`)
                .then(response => {
                    const user = response.data;
                    const username = user.username || storedUsername;
                    const avatar = user.avatar; // Lấy trực tiếp từ API
                    const finalAvatar = avatar.startsWith('http') ? avatar : `http://localhost:8080/media/${avatar}`;
                    setInitialUsername(username);
                    setAvatarPreview(finalAvatar);
                    localStorage.setItem('currentUserUsername', username);
                    localStorage.setItem('currentUserAvatar', avatar); // Lưu giá trị từ API (tên file hoặc URL)
                })
                .catch(err => {
                    console.error('Lỗi khi lấy thông tin user:', err);
                    setAvatarPreview(defaultAvatar); // Fallback nếu API lỗi
                })
                .finally(() => setLoading(false));
        }
    }, [router]);

    const validationSchema = Yup.object({
        username: Yup.string()
            .required('Tên hiển thị không được để trống')
            .max(50, 'Tên hiển thị không được vượt quá 50 ký tự'),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        const formData = new FormData();
        formData.append('email', currentEmail);
        formData.append('username', values.username);
        if (values.avatar) {
            formData.append('avatar', values.avatar);
        }

        try {
            const response = await axios.post('http://localhost:8080/users/edit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Cập nhật thông tin thành công!', { autoClose: 1500 });
            if (response.data.avatar) {
                setAvatarPreview(response.data.avatar); // Cập nhật ngay avatarPreview
                localStorage.setItem('currentUserAvatar', response.data.avatar);
            }
            if (values.username) {
                localStorage.setItem('currentUserUsername', values.username);
            }
            setTimeout(() => router.push('/'), 1500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cập nhật không thành công. Vui lòng kiểm tra lại file upload hoặc kết nối backend.', { autoClose: 3000 });
            console.error('Lỗi submit:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/');
    };

    const handleAvatarChange = (event) => {
        const file = event.currentTarget.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            axios.post('http://localhost:8080/users/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
                .then(response => {
                    const avatarUrl = `http://localhost:8080/media/${response.data}`;
                    setAvatarPreview(avatarUrl);
                    // Reload profile để cập nhật avatar
                    axios.get(`http://localhost:8080/users/profile?email=${encodeURIComponent(currentEmail)}`)
                        .then(profileResponse => {
                            const avatar = profileResponse.data.avatar;
                            setAvatarPreview(avatar.startsWith('http') ? avatar : `http://localhost:8080/media/${avatar}`);
                            localStorage.setItem('currentUserAvatar', avatar);
                        })
                        .catch(err => console.error('Lỗi reload profile:', err));
                })
                .catch(error => {
                    console.error('Lỗi upload avatar:', error);
                    setAvatarPreview('http://localhost:8080/media/default-avatar.png');
                });
        }
    };

    if (loading) {
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
                            <p>{currentEmail || 'Không tìm thấy email'}</p>
                        </div>
                        <div>
                            <label>Tên hiển thị <span style={{ color: 'red' }}>*</span></label>
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
                                onChange={(event) => {
                                    setFieldValue('avatar', event.currentTarget.files[0]);
                                    handleAvatarChange(event);
                                }}
                                style={{ marginBottom: '10px' }}
                            />
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