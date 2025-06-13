import { Box, Button, Page, Text, Icon } from "zmp-ui";
import { useState, useEffect } from "react";
import { getToken, logout } from "@/utils/user"; // Giả sử bạn lưu token trong localStorage
import ExerciseList from "./exercisedashboard";
import CategoryList from "./categorydashboard";
import MealList from "./mealdashboard";
import { useAppNavigation } from "@/utils/navigation";

// Định nghĩa kiểu cho menu item với các giá trị icon hợp lệ
type IconType =
    | "zi-home"
    | "zi-run"
    | "zi-list"
    | "zi-food";  // Cập nhật danh sách các icon hợp lệ tùy theo thư viện hỗ trợ

interface MenuItem {
    id: string;
    label: string;
    icon: IconType; // Định nghĩa lại kiểu icon cho hợp lệ
}

function AdminDashBoard() {
    const [activeMenu, setActiveMenu] = useState<string>("dashboard");
    const { goToLoggin } = useAppNavigation();
    // Các state để lưu số lượng
    const [exerciseCount, setExerciseCount] = useState<number>(0);
    const [categoryCount, setCategoryCount] = useState<number>(0);
    const [mealCount, setMealCount] = useState<number>(0);

    const [loading, setLoading] = useState<boolean>(false); // Trạng thái loading
    const [error, setError] = useState<string | null>(null); // Thông báo lỗi

    const menuItems: MenuItem[] = [
        { id: "dashboard", label: "Dashboard", icon: "zi-home" },
        { id: "exercise", label: "Exercise", icon: "zi-run" },
        { id: "category", label: "Category", icon: "zi-list" },
        { id: "meal", label: "Meal", icon: "zi-food" },
    ];

    // Hàm gọi API để đếm số lượng bài tập
    const fetchExerciseCount = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            if (!token) {
                throw new Error('No authentication token found. Please log in.');
            }

            const response = await fetch("http://localhost:8080/gym/api/v1/exercises/count", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': 'vi',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.code === 0) {
                setExerciseCount(data.result);
            } else {
                throw new Error("Failed to fetch exercise count.");
            }
        } catch (error) {
            setError("Error fetching exercise count.");
            console.error("Error fetching exercise count:", error);
        } finally {
            setLoading(false);
        }
    };

    // Hàm gọi API để đếm số lượng categories
    const fetchCategoryCount = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            if (!token) {
                throw new Error('No authentication token found. Please log in.');
            }

            const response = await fetch("http://localhost:8080/gym/api/v1/categories/count", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': 'vi',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.code === 0) {
                setCategoryCount(data.result);
            } else {
                throw new Error("Failed to fetch category count.");
            }
        } catch (error) {
            setError("Error fetching category count.");
            console.error("Error fetching category count:", error);
        } finally {
            setLoading(false);
        }
    };

    // Hàm gọi API để đếm số lượng meals
    const fetchMealCount = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            if (!token) {
                throw new Error('No authentication token found. Please log in.');
            }

            const response = await fetch("http://localhost:8080/gym/api/v1/meals/count", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': 'vi',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.code === 0) {
                setMealCount(data.result);
            } else {
                throw new Error("Failed to fetch meal count.");
            }
        } catch (error) {
            setError("Error fetching meal count.");
            console.error("Error fetching meal count:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout(); // Gọi hàm logout
        goToLoggin();
    };

    // Gọi API khi component mount hoặc khi dashboard được chọn
    useEffect(() => {
        if (activeMenu === "dashboard") {
            fetchExerciseCount();
            fetchCategoryCount();
            fetchMealCount();
        }
    }, [activeMenu]);

    return (
        <Page className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <Box className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
                <Text.Title size="large" className="font-bold">
                    Fitness Admin Panel
                </Text.Title>
                <Button
                    variant="secondary"
                    className="bg-blue-500 text-white"
                    size="small"
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </Box>

            <Box className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <Box className="w-64 bg-white shadow-md p-4">
                    {menuItems.map((item) => (
                        <Button
                            key={item.id}
                            variant={activeMenu === item.id ? "primary" : "secondary"}
                            className={`w-full mb-2 flex items-center justify-start ${activeMenu === item.id ? "bg-blue-100 text-blue-600" : "text-gray-600"
                                }`}
                            onClick={() => setActiveMenu(item.id)}
                        >
                            <Icon className="mr-4" />
                            {item.label}

                        </Button>
                    ))}
                </Box>

                {/* Main Content */}
                <Box className="flex-1 p-6 overflow-auto">
                    {activeMenu === "dashboard" && (
                        <Box>
                            <Text.Title size="xLarge" className="font-bold mb-4">
                                Fitness Dashboard
                            </Text.Title>

                            <Box className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Box className="bg-white p-6 rounded-lg shadow-md">
                                    <Text className="font-semibold text-lg">Total Exercise</Text>
                                    {loading ? (
                                        <Text size="xLarge" className="mt-2 text-blue-600">Loading...</Text>
                                    ) : error ? (
                                        <Text size="xLarge" className="mt-2 text-red-600">{error}</Text>
                                    ) : (
                                        <Text size="xLarge" className="mt-2 text-blue-600">{exerciseCount}</Text>
                                    )}
                                </Box>
                                <Box className="bg-white p-6 rounded-lg shadow-md">
                                    <Text className="font-semibold text-lg">Total Category</Text>
                                    {loading ? (
                                        <Text size="xLarge" className="mt-2 text-blue-600">Loading...</Text>
                                    ) : error ? (
                                        <Text size="xLarge" className="mt-2 text-red-600">{error}</Text>
                                    ) : (
                                        <Text size="xLarge" className="mt-2 text-blue-600">{categoryCount}</Text>
                                    )}
                                </Box>
                                <Box className="bg-white p-6 rounded-lg shadow-md">
                                    <Text className="font-semibold text-lg">Total Meal</Text>
                                    {loading ? (
                                        <Text size="xLarge" className="mt-2 text-blue-600">Loading...</Text>
                                    ) : error ? (
                                        <Text size="xLarge" className="mt-2 text-red-600">{error}</Text>
                                    ) : (
                                        <Text size="xLarge" className="mt-2 text-blue-600">{mealCount}</Text>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {activeMenu === "exercise" && <ExerciseList />}
                    {activeMenu === "category" && <CategoryList />}
                    {activeMenu === "meal" && <MealList />}
                </Box>
            </Box>
        </Page>
    );
}

export default AdminDashBoard;
