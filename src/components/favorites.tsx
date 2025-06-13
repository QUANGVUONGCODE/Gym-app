import React, { useState, useEffect } from "react";
import { Box, Text, Button } from "zmp-ui";
import { useAppNavigation } from "@/utils/navigation";
import { faArrowLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';
import Footer from "./footer/footer";
import { getToken, getUserId } from "@/utils/user";
import moment from "moment";
// Định nghĩa interface cho meal
interface Meal {
    id: number;
    name: string;
    calories: number;
    fat: number;
    carbs: number;
    protein: number;
}

// Định nghĩa interface cho nutrition entry
interface NutritionEntry {
    id: number;
    meal: Meal;
    mealType: string;
    waterIntake: number;
    date: string;
    time: string;
}

// Định nghĩa interface cho exercise
interface Exercise {
    id: number;
    name: string;
    description: string;
    videoUrl: string;
    time: string;
    calories: number;
    category: {
        id: number;
        name: string;
    };
    level: string;
}

// Định nghĩa interface cho workout plan
interface WorkoutPlan {
    id: number;
    exercise: Exercise;
    date: string;
    duration: number;
    active: boolean;
}

const MyFavorites = () => {
    const [activeTab, setActiveTab] = useState<"Meal" | "Workout">("Meal");
    const [nutritionData, setNutritionData] = useState<NutritionEntry[]>([]);
    const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]); // State cho workout
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(moment().format("YYYY-MM-DD")); // Ngày hôm nay
    const { goback, goToMealDetail, goToExerciseDetail } = useAppNavigation();
    const userId = getUserId() ?? 0;
    const token = getToken();
    if (!token) {
        throw new Error('No authentication token found. Please log in.');
    }
    // Lấy danh sách ngày trong tuần (dựa trên ngày hiện tại)
    const today = new Date(selectedDate);
    const daysInWeek = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        // Điều chỉnh để lấy Chủ nhật của tuần này
        date.setDate(today.getDate() - today.getDay() + i); // Tính từ Chủ nhật hiện tại
        return {
            day: date.toLocaleString("en-US", { weekday: "short" }),
            number: date.getDate(),
        };
    });



    // Hàm gọi API để lấy dữ liệu dinh dưỡng (Meal)
    const fetchNutritionData = async (date: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/gym/api/v1/nutrition?user_id=1&date=${date}`, {
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
            console.log("Nutrition API Response Data:", data);
            if (data.code === 0 && Array.isArray(data.result)) {
                setNutritionData(data.result);
            } else {
                setError("No nutrition data found");
            }
        } catch (error) {
            setError("Error fetching nutrition data");
            console.error("Error fetching nutrition data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Hàm gọi API để lấy dữ liệu bài tập (Workout)
    const fetchWorkoutPlans = async (date: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/gym/api/v1/workout-plans?user_id=${userId}&date=${date}`, {
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
            console.log("Workout Plans API Response Data:", data);
            if (data.code === 0 && Array.isArray(data.result)) {
                setWorkoutPlans(data.result);
            } else {
                setError("No workout plans found");
            }
        } catch (error) {
            setError("Error fetching workout plans");
            console.error("Error fetching workout plans:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteMeal = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:8080/gym/api/v1/nutrition/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                setNutritionData(prev => prev.filter(item => item.id !== id));
            }
        } catch (err) {
            alert("Failed to delete meal.");
        }
    };

    const deleteWorkout = async (id: number) => {
        const plan = workoutPlans.find(p => p.id === id);
        if (!plan || plan.active) {
            alert("This workout has already been completed and cannot be deleted.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/gym/api/v1/workout-plans/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                setWorkoutPlans(prev => prev.filter(p => p.id !== id));
            }
        } catch (err) {
            alert("Failed to delete workout plan.");
        }
    };

    // Gọi API khi component mount hoặc ngày thay đổi
    useEffect(() => {
        fetchNutritionData(selectedDate);
        fetchWorkoutPlans(selectedDate);
    }, [selectedDate]);

    // Xử lý chọn ngày
    const handleDateChange = (offset: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + offset);
        setSelectedDate(newDate.toISOString().split("T")[0]);
    };



    return (
        <>
            {/* Header */}
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
                    <Text className="text-[24px] font-bold mr-24">My Favorites</Text>

                </Box>
            </Box>

            {/* Tabs */}
            <Box className="flex justify-center mt-4">
                <Button
                    className={`py-2 px-6 rounded-md ${activeTab === "Meal" ? "bg-black text-white" : "bg-gray-200 text-black"
                        }`}
                    onClick={() => setActiveTab("Meal")}
                >
                    Meal
                </Button>
                <Button
                    className={`py-2 px-6 rounded-md ml-2 ${activeTab === "Workout" ? "bg-black text-white" : "bg-gray-200 text-black"
                        }`}
                    onClick={() => setActiveTab("Workout")}
                >
                    Workout
                </Button>
            </Box>

            {/* Lịch */}
            <Box className="mt-6 px-6">
                <Box className="flex justify-between items-center">
                    <Button
                        className="bg-gray-200 px-2 py-1 rounded-md"
                        onClick={() => handleDateChange(-7)} // Giảm 1 tuần
                    >
                        <i className="fa fa-chevron-left text-black"></i>
                    </Button>
                    <Text className="text-lg font-semibold">
                        {new Date(selectedDate).toLocaleString("en-US", { month: "long", year: "numeric" })}
                    </Text>
                    <Button
                        className="bg-gray-200 px-2 py-1 rounded-md"
                        onClick={() => handleDateChange(7)} // Tăng 1 tuần
                    >
                        <i className="fa fa-chevron-right text-black"></i>
                    </Button>
                </Box>

                {/* Ngày trong tuần */}
                <Box className="flex overflow-auto gap-4 space-x-2 mt-4">
                    {daysInWeek.map((item, index) => (
                        <Box
                            key={index}
                            flex
                            flexDirection="column"
                            className="rounded-md p-2 pb-3 flex items-center justify-center text-[15px] cursor-pointer gap-1"
                            onClick={() => {
                                const newDate = new Date(selectedDate);
                                newDate.setDate(newDate.getDate() - newDate.getDay() + index);
                                setSelectedDate(newDate.toISOString().split("T")[0]);
                            }}
                        >
                            <Text>{item.day}</Text>
                            <Text
                                className={`p-1 px-2 rounded-full justify-center text-center font-semibold text-sm ${new Date(selectedDate).getDate() === item.number
                                    ? "bg-black text-white"
                                    : "bg-gray-200 text-gray-600"
                                    }`}
                            >
                                {item.number}
                            </Text>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Danh sách món ăn hoặc bài tập */}
            <Box className="mt-4 px-6 mb-20">
                {loading ? (
                    <Box className="flex justify-center items-center">
                        <Text>Loading...</Text>
                    </Box>
                ) : error ? (
                    <Box className="flex justify-center items-center">
                        <Text className="text-red-500">{error}</Text>
                    </Box>
                ) : activeTab === "Meal" ? (
                    nutritionData.length > 0 ? (
                        nutritionData.map((entry, index) => (
                            <Box
                                onClick={() => goToMealDetail(entry.meal.id)}
                                key={index}
                                className={`relative rounded-xl mb-4 ${index < nutritionData.length - 1 ? "border-b-2 border-gray-300 pb-4" : ""
                                    }`} // Dấu gạch dưới cho tab Meal
                            >
                                <img
                                    src="/src/assets/meal-2.png"
                                    alt={entry.meal.name}
                                    className="w-full h-56 object-cover rounded-lg"
                                />

                                <Box className="mt-4">
                                    <Text className="font-semibold text-lg">{entry.meal.name}</Text>
                                    <Box className="flex items-center mt-2">
                                        <Box className="flex items-center">
                                            <i className="fa fa-fire text-green-400 pl-1"></i>
                                            <Text className="text-sm text-gray-600 ml-2">
                                                {entry.meal.calories} kcal
                                            </Text>
                                        </Box>
                                        <Box className="flex items-center ml-4">
                                            <i className="fa fa-clock text-green-400 pl-2 border-l border-gray-600"></i>
                                            <Text className="text-sm text-gray-600 ml-2">
                                                30 min {/* Giả định thời gian chuẩn bị */}
                                            </Text>
                                        </Box>
                                        <Box className="flex items-center">
                                            <i className="fa fa-fire text-green-400 pl-1"></i>
                                            <Text className="text-sm text-gray-600 ml-2">
                                                {entry.mealType}
                                            </Text>
                                        </Box>
                                        <Box className="flex items-center ml-4">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
                                                    deleteMeal(entry.id);
                                                }}
                                                className="ml-28 text-red-500 hover:text-red-600 focus:outline-none"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="text-[20px] cursor-pointer" />
                                            </button>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        ))
                    ) : (
                        <Text className="text-sm text-gray-600">No meals found for this date.</Text>
                    )
                ) : (
                    workoutPlans.length > 0 ? (
                        workoutPlans.map((plan, index) => (
                            <Box
                                onClick={() => goToExerciseDetail(plan.exercise.id)}
                                key={index}
                                className={`mb-4 ${index < workoutPlans.length - 1 ? "border-b-2 border-gray-300 pb-4" : ""
                                    }`} // Dấu gạch dưới cho tab Workout
                            >
                                <img
                                    src="/src/assets/exercise-2.png" // Placeholder vì API không có image
                                    alt={plan.exercise.name}
                                    className="w-full h-56 object-cover rounded-lg"
                                />
                                <Box className="mt-4">
                                    <Box className="mt-4">
                                        <Text className="font-semibold text-lg">{plan.exercise.name}</Text>
                                        <Box className="flex items-center justify-between mt-2">
                                            <Text className="text-sm text-gray-600">{plan.exercise.level} • {plan.exercise.time}</Text>
                                            {!plan.active && (
                                                <FontAwesomeIcon icon={faTrash} className="text-red-500 cursor-pointer" onClick={() => deleteWorkout(plan.id)} />
                                            )}
                                            {plan.active && (
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                                            )}
                                        </Box>
                                    </Box>
                                </Box>


                            </Box>
                        ))
                    ) : (
                        <Text className="text-sm text-gray-600">No workouts found for this date.</Text>
                    )
                )}
            </Box>

            <Footer />
        </>
    );
};

export default MyFavorites;