import React, { useEffect, useState } from 'react';
import { Box, Text, Input, Button, Avatar } from 'zmp-ui'; // Các thành phần có sẵn trong zmp-ui
import Footer from '../footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import CategoryList from '@/components/home/selectedcategory';
import { useAppNavigation } from '@/utils/navigation';
import { getToken, getUserId } from '@/utils/user';
const Profile = () => {
    const [user, setUser] = useState<any>(null); // Lưu trữ dữ liệu người dùng
    const [nutritionData, setNutritionData] = useState<any>([]); // Lưu trữ dữ liệu dinh dưỡng
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { goToEditProfile, goback } = useAppNavigation();
    const userId = getUserId() ?? 0;
    const token = getToken();
    if (!token) {
        throw new Error('No authentication token found. Please log in.');
    }
    const fetchUserData = async () => {
        setLoading(true);
        setError(null); // Reset lỗi khi bắt đầu tải

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
            console.log(data); // Xem dữ liệu trả về từ API

            if (data.code === 0 && data.result) {
                setUser(data.result); // Cập nhật thông tin người dùng vào state
            } else {
                setError("No user data available"); // Nếu không có dữ liệu hợp lệ
            }
        } catch (error) {
            setError("Error fetching user data: "); // Xử lý lỗi
        } finally {
            setLoading(false); // Kết thúc trạng thái loading
        }
    };

    const fetchNutritionData = async () => {
        setLoading(true);
        setError(null); // Reset lỗi khi bắt đầu tải
        const today = new Date().toISOString().split('T')[0];
        try {
            const response = await fetch(`http://localhost:8080/gym/api/v1/nutrition?user_id=${userId}&date=${today}`, {
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
            console.log(data); // Xem dữ liệu trả về từ API

            if (data.code === 0 && data.result) {
                setNutritionData(data.result); // Cập nhật dữ liệu dinh dưỡng vào state
            } else {
                setError("No nutrition data available"); // Nếu không có dữ liệu hợp lệ
            }
        } catch (error) {
            setError("Error fetching nutrition data: "); // Xử lý lỗi
        } finally {
            setLoading(false); // Kết thúc trạng thái loading
        }
    };

    // Tính tổng protein, carbs, fat
    const calculateTotalMacros = () => {
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;

        nutritionData.forEach((item) => {
            totalProtein += item.meal.protein || 0;
            totalCarbs += item.meal.carbs || 0;
            totalFat += item.meal.fat || 0;
        });

        return {
            totalProtein,
            totalCarbs,
            totalFat,
        };
    };

    useEffect(() => {
        fetchUserData(); // Gọi API khi component được render
        fetchNutritionData();
    }, []);

    const { totalProtein, totalCarbs, totalFat } = calculateTotalMacros();
    return (
        <>
            <Box className=" justify-center items-center mt-12">
                <Box className="flex justify-between items-center px-4">
                    <div className="flex items-center justify-center bg-transparent pointer"
                        onClick={goback}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} size="lg" className="text-[24px] text-black mr-24" />
                    </div>
                    <Text className="text-[24px] font-bold mr-24">PROFILE</Text>
                    <div
                        onClick={goToEditProfile}
                        className="flex items-center justify-center bg-transparent">
                        <FontAwesomeIcon icon={faPenToSquare} size="lg" className="text-black" />
                    </div>
                </Box>
            </Box>
            {/* Avatar */}
            <Box flex flexDirection="column" alignItems="center" className="pb-2">
                <Avatar
                    className="mb-2 mt-2"
                    size={120}
                    src={user ? `http://localhost:8080/gym/api/v1/images/${user.description}`
                        : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"}
                ></Avatar>
                <Text className="font-bold text-[22px] mb-2 mt-3">{user ? user.name : "User"}</Text>
            </Box>
            {/* WEIGHT HEIGHT AGE */}
            <Box className="flex justify-between items-center pb-2 px-20">
                {/* Weight */}
                <Box className="flex flex-col items-center ">
                    <Box className="flex justify-center items-center gap-1">
                        <Text className="font-bold text-[22px]">{user ? user.weight : "0"}</Text>
                        <Text className="font-semibold text-[14px]">kg</Text>
                    </Box>
                    <Text className="font-semibold text-[14px]">Weight</Text>
                </Box>


                {/* Height */}
                <Box className="flex flex-col items-center border-x border-gray-400 px-6">
                    <Box className="flex justify-center items-center gap-1">
                        <Text className="font-bold text-[22px]">{user ? user.height : "0"}</Text>
                        <Text className="font-semibold text-[14px]">cm</Text>
                    </Box>
                    <Text className="font-semibold text-[14px]">Height</Text>
                </Box>

                {/* Age */}
                <Box className="flex flex-col items-center">
                    <Box className="flex justify-center items-center gap-1">
                        <Text className="font-bold text-[22px]">{user ? user.age : "0"}</Text>
                        <Text className="font-semibold text-[14px]">year</Text>
                    </Box>
                    <Text className="font-semibold text-[14px]">Age</Text>
                </Box>
            </Box>
            {/* Goal */}
            <CategoryList />
            <Box className="my-6 px-6">
                <Text className="font-bold text-xl mb-4">Macronutrient Goals</Text>
                <Box className="grid grid-cols-3 gap-6 mb-4 ">
                    {/* Meal1 */}
                    <Box flex flexDirection="column" alignItems="center" className="pb-2">
                        <Avatar
                            className="mb-2"
                            size={61}
                            // Giữ một hình ảnh mặc định cho tất cả các danh mục
                            src={"src/assets/meal/protein.png"}
                        />
                        <Text className="font-bold text-[15px]">Protein</Text>
                        <Text className="font-semibold text-[15px]">{totalProtein}</Text>
                        <Text className="font-normal text-[14px]">Grams per day</Text>
                    </Box>
                    {/* Meal1 */}
                    <Box flex flexDirection="column" alignItems="center" className="pb-2">
                        <Avatar
                            className="mb-2"
                            size={61}
                            // Giữ một hình ảnh mặc định cho tất cả các danh mục
                            src={"src/assets/meal/carbs.png"}
                        />
                        <Text className="font-bold text-[15px]">Carbs</Text>
                        <Text className="font-semibold text-[15px]">{totalCarbs}</Text>
                        <Text className="font-normal text-[14px]">Grams per day</Text>
                    </Box>
                    {/* Meal1 */}
                    <Box flex flexDirection="column" alignItems="center" className="pb-2">
                        <Avatar
                            className="mb-2"
                            size={61}
                            // Giữ một hình ảnh mặc định cho tất cả các danh mục
                            src={"src/assets/meal/fat.png"}
                        />
                        <Text className="font-bold text-[15px]">Fat</Text>
                        <Text className="font-semibold text-[15px]">{totalFat}</Text>
                        <Text className="font-normal text-[14px]">Grams per day</Text>
                    </Box>
                </Box>
            </Box>
            <Footer />
        </>
    );

};

export default Profile;