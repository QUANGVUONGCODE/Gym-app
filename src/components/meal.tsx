import React, { useState, useEffect } from "react";
import { Box, Text, Button } from "zmp-ui";
import Footer from "./footer/footer";
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppNavigation } from "@/utils/navigation";
import { getToken } from "@/utils/user";
// Định nghĩa interface cho meal để đảm bảo kiểu dữ liệu
interface Meal {
    id: number;
    name: string;
    calories: number;
    fat: number;
    carbs: number;
    protein: number;
}

const MealPlan = () => {
    const [meals, setMeals] = useState<Meal[]>([]); // Danh sách món ăn
    const [page, setPage] = useState(0); // Trang hiện tại
    const [hasMore, setHasMore] = useState(true); // Kiểm tra còn dữ liệu không
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { goback, goToMealDetail } = useAppNavigation();
    // Hàm gọi API để lấy danh sách món ăn
    const fetchMeals = async (pageNumber: number, isLoadMore: boolean = false) => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            if (!token) {
                throw new Error('No authentication token found. Please log in.');
            }
            const response = await fetch(`http://localhost:8080/gym/api/v1/meals?keyword=&page=${pageNumber}&limit=10`, {
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
            console.log(`Meals API Response Data (Page ${pageNumber}):`, data);
            if (data.code === 0 && data.result && Array.isArray(data.result.meals)) {
                const newMeals = data.result.meals;
                // Nếu là load more, nối dữ liệu mới vào meals hiện tại
                setMeals((prev) => (isLoadMore ? [...prev, ...newMeals] : newMeals));
                // Kiểm tra còn dữ liệu không (nếu trả về < 10 món, có thể hết)
                setHasMore(newMeals.length === 10);
            } else {
                setError("No meals data found");
                setHasMore(false);
            }
        } catch (error) {
            setError("Error fetching meals");
            console.error("Error fetching meals:", error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    const handleExerciseClick = (exerciseId) => {
        console.log("Navigating to exercise detail for ID:", exerciseId);
        goToMealDetail(exerciseId);  // Điều hướng đến chi tiết bài tập với id
    };

    // Gọi API khi component mount
    useEffect(() => {
        fetchMeals(0);
    }, []);

    // Xử lý nhấn nút See More
    const handleSeeMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchMeals(nextPage, true); // isLoadMore = true để nối dữ liệu
    };

    return (
        <>
            <Box className="justify-center items-center mt-16">
                {/* Đặt các phần tử trong cùng một container */}
                <Box className="flex justify-between items-center px-4">
                    {/* Nút quay lại */}
                    <div
                        onClick={goback}
                        className="flex items-center justify-center bg-white rounded-full w-10 h-10 shadow-md cursor-pointer">
                        <FontAwesomeIcon icon={faArrowLeft} className="text-[24px] text-black" />
                    </div>

                    {/* Tiêu đề Meal Plan */}
                    <Text className="text-[24px] font-bold mr-28">Meal plan</Text>

                </Box>
            </Box>

            <Box className="mt-4 px-6 mb-20">
                {loading && meals.length === 0 ? (
                    <Box className="flex justify-center items-center">
                        <Text>Loading...</Text>
                    </Box>
                ) : error ? (
                    <Box className="flex justify-center items-center">
                        <Text className="text-red-500">{error}</Text>
                    </Box>
                ) : (
                    <>
                        <Box className="flex justify-between items-center">
                            <Text className="font-bold text-xl mb-4">{meals.length} meals</Text>
                        </Box>

                        {/* Danh sách món ăn */}
                        {meals.length > 0 ? (
                            meals.map((meal, index) => (
                                <Box key={index} className="relative rounded-xl mb-4 pointer"
                                    onClick={() => handleExerciseClick(meal.id)}
                                >
                                    <img
                                        src={"/src/assets/meal-1.png"}
                                        alt={meal.name || "Meal"}
                                        className="w-full h-56 object-cover rounded-lg"
                                    />
                                    <Box className="mt-4 border-b-2 border-gray-300 pb-4">
                                        <Text className="font-semibold text-lg">
                                            {meal.name || "Untitled Meal"}
                                        </Text>
                                        <Box className="flex items-center">
                                            <i className="fa fa-fire text-green-400 pl-1"></i>
                                            <Text className="text-sm text-gray-600 ml-2">
                                                {meal.calories ? `${meal.calories} kcal` : "N/A"}
                                            </Text>
                                        </Box>
                                    </Box>
                                </Box>
                            ))
                        ) : (
                            <Text className="text-sm text-gray-600">No meals available</Text>
                        )}

                        {/* Nút See More */}
                        {hasMore && !loading && meals.length > 0 && (
                            <Box className="flex justify-center mt-6">
                                <Button
                                    onClick={handleSeeMore}
                                    className="py-2 px-6 bg-green-500 text-white rounded-md"
                                >
                                    See More
                                </Button>
                            </Box>
                        )}

                        {/* Hiển thị loading khi đang tải thêm */}
                        {loading && meals.length > 0 && (
                            <Box className="flex justify-center mt-4">
                                <Text>Loading more...</Text>
                            </Box>
                        )}
                    </>
                )}
            </Box>
            {/* Footer */}
            <Footer />
        </>
    );
};

export default MealPlan;