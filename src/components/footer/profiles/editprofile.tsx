import React, { useState, useEffect } from 'react';
import { Box, Text, Input, Button, Avatar, Select } from 'zmp-ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { useAppNavigation } from '@/utils/navigation';
import { getToken, getUserId } from '@/utils/user';

const EditProfile2 = () => {
    const [user, setUser] = useState<any>(null);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [gender, setGender] = useState('Male');
    const [age, setAge] = useState('');
    const [description, setDescription] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { goToProfile, goback } = useAppNavigation();
    const token = getToken();
    const userId = getUserId() ?? 0;

    // Lấy thông tin người dùng từ API
    const fetchUserData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:8080/gym/api/v1/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': 'vi',
                    'Origin': 'http://localhost:3000',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.code === 0 && data.result) {
                const userData = data.result;
                setFullName(userData.name);
                setPhone(userData.phone_number);
                setEmail(userData.email || '');
                setWeight(userData.weight || '');
                setHeight(userData.height || '');
                setGender(userData.gender || 'Male');
                setAge(userData.age || '');
                setDescription(userData.description || '');
                setPreviewUrl(userData.description ? `/uploads/${userData.description}` : null);
                setUser(userData);
            } else {
                setError('No user data available');
            }
        } catch (error) {
            setError('Error fetching user data');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý chọn file ảnh
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Gửi ảnh đại diện mới đến API
    const handleUploadAvatar = async () => {
        if (!avatarFile) {
            alert('Please select an image file');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', avatarFile);

        try {
            const response = await fetch(`http://localhost:8080/gym/api/v1/users/uploads/${userId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': 'vi',
                    'Origin': 'http://localhost:3000',
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                if (data.result && data.result.url) {
                    setDescription(data.result.url);
                    setPreviewUrl(`/uploads/${data.result.url}`);
                    alert('Avatar updated successfully!');
                    await fetchUserData();
                } else {
                    setError('Failed to upload avatar');
                }
            } else {
                throw new Error(`Error: ${response.status}`);
            }
        } catch (error) {
            setError('Error uploading avatar');
        } finally {
            setLoading(false);
            setAvatarFile(null);
        }
    };

    // Gửi dữ liệu hồ sơ đã chỉnh sửa đến API
    const handleSave = async () => {
        const updatedUser = {
            name: fullName,
            phone_number: phone,
            email: email,
            weight: weight,
            height: height,
            gender: gender,
            age: age,
            
        };

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:8080/gym/api/v1/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updatedUser),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.code === 0) {
                    alert('Profile updated successfully!');
                    await fetchUserData();
                } else {
                    setError('Failed to update profile');
                }
            } else {
                throw new Error(`Error: ${response.status}`);
            }
        } catch (error) {
            setError('Error saving data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <>
            <Box className="justify-center items-center mt-11">
                <Box className="flex justify-between items-center px-4 pointer" onClick={goback}>
                    <FontAwesomeIcon icon={faArrowLeft} size="lg" className="text-[24px] text-black" />
                    <Text className="text-[24px] font-bold text-center mr-24">Edit Profile</Text>
                </Box>
            </Box>

            <Box className="p-4">
                <Box className="flex flex-col items-center mb-4">
                    <Avatar
                        className="mb-2 mt-2"
                        size={120}
                        src={
                            
                            (description ? `http://localhost:8080/gym/api/v1/images/${description}` : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=880&q=80')
                        }
                    />
                    <Box className="flex items-center">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                            id="avatar-upload"
                        />
                        <label htmlFor="avatar-upload" className="cursor-pointer mr-2">
                            <FontAwesomeIcon icon={faPenToSquare} size="lg" className="text-blue-500" />
                        </label>
                        {avatarFile && (
                            <Button
                                onClick={handleUploadAvatar}
                                loading={loading}
                                className="bg-blue-500 text-white px-3 py-1 rounded"
                            >
                                Upload Avatar
                            </Button>
                        )}
                    </Box>
                </Box>

                <Box className="mb-3">
                    <Text className="text-lg">Full Name</Text>
                    <Input
                        className="w-full"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full Name"
                    />
                </Box>

                <Box className="mb-3">
                    <Text className="text-lg">Phone</Text>
                    <Input
                        className="w-full"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone"
                    />
                </Box>

                <Box className="mb-3">
                    <Text className="text-lg">Email Address</Text>
                    <Input
                        className="w-full"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                    />
                </Box>

                <Box className="flex justify-between mb-3">
                    <Box className="w-48%">
                        <Text className="text-lg">Weight</Text>
                        <Input
                            className="w-full"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="Weight"
                        />
                    </Box>
                    <Box className="w-48%">
                        <Text className="text-lg">Height</Text>
                        <Input
                            className="w-full"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            placeholder="Height"
                        />
                    </Box>
                </Box>

                <Box className="mb-3">
                    <Text className="text-lg">Gender</Text>
                    <Select
                        className="w-full"
                        value={gender}
                        onChange={(value) => setGender(value as string || 'Male')}
                    >
                        <Select.Option value="Male">Male</Select.Option>
                        <Select.Option value="Female">Female</Select.Option>
                        <Select.Option value="Other">Other</Select.Option>
                    </Select>
                </Box>

                <Box className="mb-3">
                    <Text className="text-lg">Age</Text>
                    <Input
                        className="w-full"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Age"
                    />
                </Box>

                <Button className="bg-green-500 rounded-lg text-white w-full p-3" onClick={handleSave} loading={loading}>
                    Save
                </Button>

                {error && (
                    <Text className="text-red-500 mt-2 text-center">{error}</Text>
                )}
            </Box>
        </>
    );
};

export default EditProfile2;