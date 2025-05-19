import React, { useState, useEffect } from "react";
import { Box, Text, Button, Input } from "zmp-ui";
import { Progress, Modal } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faShoePrints, faMoon, faHeartbeat, faFire } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "zmp-ui";
import Footer from "@/components/footer/footer";
import { getToken, getUserId } from "@/utils/user";

interface HealthData {
    walk: number;
    sleep: string;
    heart_rate: number;
    calories: number;
}

interface WeeklyHealthData {
    [day: string]: HealthData | null;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Today");
    const [selectedDay, setSelectedDay] = useState<string>("");
    const [todayDayOfWeek, setTodayDayOfWeek] = useState<string>("");
    const [healthData, setHealthData] = useState<HealthData | null>(null);
    const [weeklyHealthData, setWeeklyHealthData] = useState<WeeklyHealthData>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [weekNumber, setWeekNumber] = useState<number>(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(true);
    const [weekData, setWeekData] = useState<HealthData | null>(null);
    const [monthData, setMonthData] = useState<HealthData | null>(null);
    const [formData, setFormData] = useState({
        walk: "",
        calories: "",
        heart_rate: "",
        sleep: "",
    });

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const token = getToken();
    const userId = getUserId();

    useEffect(() => {
        if (!token || !userId) {
            setError("No authentication token or user ID found. Please log in.");
            setLoading(false);
        }

        const today = new Date();
        const dayIndex = today.getDay(); // getDay() sẽ trả về giá trị từ 0 (Chủ Nhật) đến 6 (Thứ Bảy)

        const todayDay = daysOfWeek[dayIndex === 0 ? 6 : dayIndex - 1]; // Nếu là Chủ Nhật (0), ta sẽ gán là ngày cuối tuần (6)
        console.log("Today is:", todayDay);
        setTodayDayOfWeek(todayDay);
        setSelectedDay(todayDay);
    }, []);

    const calculateWeekNumberAndStartDate = () => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (Chủ Nhật) đến 6 (Thứ Bảy)
    
        // Tính ngày thứ Hai của tuần hiện tại
        const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const startOfCurrentWeek = new Date(today);
        startOfCurrentWeek.setDate(today.getDate() - daysSinceMonday);
    
        // Tính số tuần của tháng
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const diffInDays = Math.floor(
            (startOfCurrentWeek.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24)
        );
        const weekNum = Math.floor(diffInDays / 7) + 1;
    
        console.log("Start of current week (Monday):", startOfCurrentWeek.toISOString().split("T")[0]);
    
        return { weekNum, startOfCurrentWeek };
    };
    const getDateForDayOfWeek = (day: string, startOfWeek: Date) => {
        const dayIndex = daysOfWeek.indexOf(day);
        const targetDate = new Date(startOfWeek);
        targetDate.setDate(startOfWeek.getDate() + dayIndex);
        const dateStr = targetDate.toISOString().split("T")[0];
        console.log(`${day}: ${dateStr}`);
        return dateStr;
    };

    const fetchHealthData = async (userId: number, period: string, date?: string, includePeriod: boolean = true) => {
        if (!userId) {
            setError("User ID is missing. Please log in again.");
            setLoading(false);
            return null;
        }

        setLoading(true);
        setError(null);
        try {
            let url = `http://localhost:8080/gym/api/v1/health-data/period?user_id=${userId}`;

            if (includePeriod) {
                url += `&period=${period.toLowerCase()}`;
            }
            if (date && date.trim() !== "") {
                url += `&date=${date}`;
            }

            console.log("Fetching URL:", url);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
                    Authorization: `Bearer ${token}`,
                    "Accept-Language": "vi",
                    Origin: "http://localhost:3000",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch health data (Status: ${response.status})`);
            }

            const data = await response.json();
            console.log("Parsed API Response:", data);

            if (data.result) {
                const mappedData: HealthData = {
                    walk: data.result.walk,
                    sleep: data.result.sleep,
                    heart_rate: data.result.heart_rate,
                    calories: data.result.calories,
                };
                return mappedData;
            } else {
                console.log("No result in response, returning null");
                return null;
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred while fetching data. Please try again.");
            console.error("Fetch error:", err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchWeeklyHealthData = async (userId: number, startOfWeek: Date) => {
        const weeklyData: WeeklyHealthData = {};
        for (const day of daysOfWeek) {
            const date = getDateForDayOfWeek(day, startOfWeek);
            console.log(`Fetching data for ${day} (${date})`);
            const data = await fetchHealthData(userId, "day", date, false);
            weeklyData[day] = data; // Lưu dữ liệu cho từng ngày
        }
        console.log("Weekly health data fetched:", weeklyData);
        setWeeklyHealthData(weeklyData); // Cập nhật weeklyHealthData với dữ liệu mới
    };

    useEffect(() => {
        if (!userId) return;

        if (activeTab === "Today") {
            const { startOfCurrentWeek } = calculateWeekNumberAndStartDate();
            fetchWeeklyHealthData(userId, startOfCurrentWeek);
            fetchHealthData(userId, "today", undefined, true).then((data) => {
                setHealthData(data);
            });
        } else if (activeTab === "Week") {
            // Khi chuyển sang tab Week, gọi API để lấy dữ liệu tuần
            const { startOfCurrentWeek } = calculateWeekNumberAndStartDate();
            fetchWeeklyHealthData(userId, startOfCurrentWeek);  // Tải lại dữ liệu tuần
            fetchHealthData(userId, "week", undefined, true).then((data) => {
                setHealthData(data);
                setWeekData(data);  // Lưu dữ liệu tuần vào state
            });
        } else if (activeTab === "Month") {
            fetchHealthData(userId, "month", undefined, true).then((data) => {
                setMonthData(data);
                setHealthData(data);
            });
        }
    }, [activeTab, userId]);

    const handleDaySelect = (day: string) => {
        setSelectedDay(day);
        console.log(`Selected day: ${day}`);

        setWeeklyHealthData((prev) => {
            const updatedData = { ...prev };
            delete updatedData[day];
            return updatedData;
        });

        if (day === todayDayOfWeek) {
            fetchHealthData(userId!, "today", undefined, true).then((data) => {
                console.log("Setting health data for today:", data);
                setHealthData(data);
                setWeeklyHealthData((prev) => ({ ...prev, [day]: data }));
            });
        } else {
            const { startOfCurrentWeek } = calculateWeekNumberAndStartDate();
            const date = getDateForDayOfWeek(day, startOfCurrentWeek);
            console.log(`Fetching data for date: ${date}`);
            fetchHealthData(userId!, "day", date, false).then((data) => {
                console.log(`Setting health data for ${day} (${date}):`, data);
                setHealthData(data);
                setWeeklyHealthData((prev) => ({ ...prev, [day]: data }));
            });
        }
    };

    const handleAddData = () => {
        if (selectedDay !== todayDayOfWeek) {
            setFeedbackMessage("You can only add data for the current day.");
            setIsSuccess(false);
            setShowFeedbackModal(true);
            return;
        }

        setFormData({
            walk: "",
            calories: "",
            heart_rate: "",
            sleep: "",
        });
        setShowAddModal(true);
    };

    const handleUpdateData = () => {
        if (healthData) {
            setFormData({
                walk: healthData.walk.toString(),
                calories: healthData.calories.toString(),
                heart_rate: healthData.heart_rate.toString(),
                sleep: healthData.sleep,
            });
        }
        setShowUpdateModal(true);
    };

    const handleAddSubmit = async () => {
        try {
            const today = new Date().toISOString().split("T")[0];
            const response = await fetch("http://localhost:8080/gym/api/v1/health-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    "Accept-Language": "vi",
                    Origin: "http://localhost:3000",
                },
                body: JSON.stringify({
                    user_id: userId,
                    walk: parseInt(formData.walk),
                    calories: parseInt(formData.calories),
                    heart_rate: parseInt(formData.heart_rate),
                    sleep: formData.sleep,
                    date: today,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add health data");
            }

            setFeedbackMessage("Health data added successfully!");
            setIsSuccess(true);
            setShowFeedbackModal(true);
            setShowAddModal(false);

            fetchHealthData(userId!, "today", undefined, true).then((data) => {
                setHealthData(data);
                setWeeklyHealthData((prev) => ({ ...prev, [todayDayOfWeek]: data }));
            });
        } catch (err: any) {
            setFeedbackMessage(err.message || "Failed to add health data");
            setIsSuccess(false);
            setShowFeedbackModal(true);
        }
    };

    const handleUpdateSubmit = async () => {
        try {
            const response = await fetch(`http://localhost:8080/gym/api/v1/health-data/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    "Accept-Language": "vi",
                    Origin: "http://localhost:3000",
                },
                body: JSON.stringify({
                    user_id: userId,
                    walk: parseInt(formData.walk),
                    calories: parseInt(formData.calories),
                    heart_rate: parseInt(formData.heart_rate),
                    sleep: formData.sleep,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update health data");
            }

            setFeedbackMessage("Health data updated successfully!");
            setIsSuccess(true);
            setShowFeedbackModal(true);
            setShowUpdateModal(false);

            fetchHealthData(userId!, "today", undefined, true).then((data) => {
                setHealthData(data);
                setWeeklyHealthData((prev) => ({ ...prev, [todayDayOfWeek]: data }));
            });
        } catch (err: any) {
            setFeedbackMessage(err.message || "Failed to update health data");
            setIsSuccess(false);
            setShowFeedbackModal(true);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const heartRateWave = daysOfWeek.map((day) => {
        const data = weeklyHealthData[day];
        return data && data.heart_rate ? data.heart_rate / 5 : 0;
    });

    return (
        <Box className="p-4 mt-10">
            <Box className="flex items-center justify-between mb-4 pointer">
                <FontAwesomeIcon
                    icon={faArrowLeft}
                    className="text-[24px] text-black"
                    onClick={() => navigate(-1)}
                />
                <Text className="text-xl font-bold">DASHBOARD</Text>
                <Box className="w-6" />
            </Box>

            <Box className="flex gap-2 mb-4">
                {["Today", "Week", "Month"].map((tab) => (
                    <Button
                        key={tab}
                        className={`flex-1 py-2 rounded-md text-white ${activeTab === tab ? "bg-black" : "bg-gray-300"}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </Button>
                ))}
            </Box>

            {activeTab === "Week" && weekNumber > 0 && (
                <Box className="mb-4">
                    <Text className="text-lg font-semibold">Week {weekNumber} of Month</Text>
                </Box>
            )}

            {activeTab === "Today" && (
                <Box className="mb-4">
                    <Box className="flex items-end justify-between h-24 relative">
                        {heartRateWave.map((value, index) => (
                            <Box
                                key={daysOfWeek[index]}
                                className="flex-1 mx-1 flex flex-col items-center"
                                onClick={() => {
                                    console.log(`Clicked on day: ${daysOfWeek[index]}`);
                                    handleDaySelect(daysOfWeek[index]);
                                }}
                            >
                                <Box
                                    className={`w-8 rounded-t-md ${selectedDay === daysOfWeek[index] ? "bg-yellow-400" : "bg-gray-300"}`}
                                    style={{ height: `${value}px` }}
                                />
                                <Text className="text-xs mt-1">{daysOfWeek[index]}</Text>
                            </Box>
                        ))}
                        <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: "none" }}>
                            <polyline
                                fill="none"
                                stroke="#52c41a"
                                strokeWidth="2"
                                points={heartRateWave
                                    .map((value, index) => {
                                        const x = (index + 0.5) * (100 / heartRateWave.length);
                                        const y = 100 - (value * 100) / Math.max(...heartRateWave, 20);
                                        return `${x}% ${y}%`;
                                    })
                                    .join(", ")}
                            />
                            {heartRateWave.map((value, index) => {
                                if (selectedDay === daysOfWeek[index]) {
                                    const x = (index + 0.5) * (100 / heartRateWave.length);
                                    const y = 100 - (value * 100) / Math.max(...heartRateWave, 20);
                                    return (
                                        <circle
                                            key={index}
                                            cx={`${x}%`}
                                            cy={`${y}%`}
                                            r="4"
                                            fill="#52c41a"
                                            stroke="#fff"
                                            strokeWidth="2"
                                        />
                                    );
                                }
                                return null;
                            })}
                        </svg>
                    </Box>
                </Box>
            )}

            {loading ? (
                <Box className="flex justify-center items-center h-64">
                    <Text>Loading...</Text>
                </Box>
            ) : error ? (
                <Box className="flex justify-center items-center h-64">
                    <Text className="text-red-500">{error}</Text>
                </Box>
            ) : healthData ? (
                <>
                    <Text className="text-lg font-semibold mb-2">Measurement</Text>
                    <Box className="grid grid-cols-2 gap-4">
                        <Box className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                            <Box className="flex items-center gap-2 mb-2">
                                <FontAwesomeIcon icon={faShoePrints} className="text-gray-600" />
                                <Text className="text-sm font-semibold text-gray-600">WALK</Text>
                            </Box>
                            <Progress
                                type="circle"
                                percent={
                                    (healthData.walk /
                                        (activeTab === "Today" ? 10000 : activeTab === "Week" ? 70000 : 300000)) *
                                    100
                                }
                                format={() => (
                                    <Box className="text-center">
                                        <Text className="text-xl font-bold">{healthData.walk}</Text>
                                        <Text className="text-sm text-gray-600">
                                            {activeTab === "Today"
                                                ? "Steps"
                                                : activeTab === "Week"
                                                    ? "Steps (Week)"
                                                    : "Steps (Month)"}
                                        </Text>
                                    </Box>
                                )}
                                strokeColor="#52c41a"
                            />
                        </Box>

                        <Box className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                            <Box className="flex items-center gap-2 mb-2">
                                <FontAwesomeIcon icon={faMoon} className="text-gray-600" />
                                <Text className="text-sm font-semibold text-gray-600">SLEEP</Text>
                            </Box>
                            <Progress
                                type="circle"
                                percent={(parseInt(healthData.sleep.split(":")[0]) / 8) * 100}
                                format={() => (
                                    <Box className="text-center">
                                        <Text className="text-xl font-bold">{healthData.sleep}</Text>
                                        <Text className="text-sm text-gray-600">
                                            {activeTab === "Today"
                                                ? "Hours"
                                                : activeTab === "Week"
                                                    ? "Avg Hours (Week)"
                                                    : "Avg Hours (Month)"}
                                        </Text>
                                    </Box>
                                )}
                                strokeColor="#52c41a"
                            />
                        </Box>

                        <Box className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                            <Box className="flex items-center gap-2 mb-2">
                                <FontAwesomeIcon icon={faHeartbeat} className="text-gray-600" />
                                <Text className="text-sm font-semibold text-gray-600">WORKOUT</Text>
                            </Box>
                            <Text className="text-xl font-bold">{healthData.heart_rate}</Text>
                            <Text className="text-sm text-gray-600">
                                {activeTab === "Today"
                                    ? "Exercise"
                                    : activeTab === "Week"
                                        ? "Avg Exercise (Week)"
                                        : "Avg Exercise (Month)"}
                            </Text>
                        </Box>

                        <Box className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                            <Box className="flex items-center gap-2 mb-2">
                                <FontAwesomeIcon icon={faFire} className="text-gray-600" />
                                <Text className="text-sm font-semibold text-gray-600">CALORIES</Text>
                            </Box>
                            <Progress
                                type="circle"
                                percent={
                                    (healthData.calories /
                                        (activeTab === "Today" ? 2000 : activeTab === "Week" ? 14000 : 60000)) *
                                    100
                                }
                                format={() => (
                                    <Box className="text-center">
                                        <Text className="text-xl font-bold">{healthData.calories}</Text>
                                        <Text className="text-sm text-gray-600">
                                            {activeTab === "Today"
                                                ? "Kcal"
                                                : activeTab === "Week"
                                                    ? "Kcal (Week)"
                                                    : "Kcal (Month)"}
                                        </Text>
                                    </Box>
                                )}
                                strokeColor="#52c41a"
                            />
                        </Box>
                    </Box>

                    {activeTab === "Today" && (
                        <Box className="flex gap-4 mt-4 justify-center">
                            <Button
                                className="py-2 px-4 rounded-md bg-blue-500 text-white"
                                onClick={handleAddData}
                                disabled={!!healthData || selectedDay !== todayDayOfWeek}
                            >
                                Add Data
                            </Button>
                            <Button
                                className="py-2 px-4 rounded-md bg-green-500 text-white"
                                onClick={handleUpdateData}
                                disabled={!healthData || selectedDay !== todayDayOfWeek}
                            >
                                Update Data
                            </Button>
                        </Box>
                    )}
                    <Footer />
                </>
            ) : (
                <>
                    <Box className="flex justify-center items-center h-64">
                        <Text>No data available</Text>
                    </Box>
                    {activeTab === "Today" && (
                        <Box className="flex gap-4 mt-4 justify-center">
                            <Button
                                className="py-2 px-4 rounded-md bg-blue-500 text-white"
                                onClick={handleAddData}
                                disabled={selectedDay !== todayDayOfWeek}
                            >
                                Add Data
                            </Button>
                            <Button
                                className="py-2 px-4 rounded-md bg-green-500 text-white"
                                onClick={handleUpdateData}
                                disabled
                            >
                                Update Data
                            </Button>
                        </Box>
                    )}
                    <Footer />
                </>
            )}

            <Modal
                open={showAddModal}
                title="Add Health Data"
                onCancel={() => setShowAddModal(false)}
                footer={null}
                centered
            >
                <Box className="flex flex-col gap-4 p-4">
                    <Input
                        label="Steps"
                        type="number"
                        value={formData.walk}
                        onChange={(e) => handleInputChange("walk", e.target.value)}
                        placeholder="Enter steps"
                    />
                    <Input
                        label="Calories (Kcal)"
                        type="number"
                        value={formData.calories}
                        onChange={(e) => handleInputChange("calories", e.target.value)}
                        placeholder="Enter calories"
                    />
                    <Input
                        label="Heart Rate (bpm)"
                        type="number"
                        value={formData.heart_rate}
                        onChange={(e) => handleInputChange("heart_rate", e.target.value)}
                        placeholder="Enter heart rate"
                    />
                    <Input
                        label="Sleep (e.g., 6:30)"
                        value={formData.sleep}
                        onChange={(e) => handleInputChange("sleep", e.target.value)}
                        placeholder="Enter sleep duration"
                    />
                    <Button
                        className="bg-blue-500 text-white"
                        onClick={handleAddSubmit}
                        disabled={!formData.walk || !formData.calories || !formData.heart_rate || !formData.sleep}
                    >
                        Submit
                    </Button>
                </Box>
            </Modal>

            <Modal
                open={showUpdateModal}
                title="Update Health Data"
                onCancel={() => setShowUpdateModal(false)}
                footer={null}
                centered
            >
                <Box className="flex flex-col gap-4 p-4">
                    <Input
                        label="Steps"
                        type="number"
                        value={formData.walk}
                        onChange={(e) => handleInputChange("walk", e.target.value)}
                        placeholder="Enter steps"
                    />
                    <Input
                        label="Calories (Kcal)"
                        type="number"
                        value={formData.calories}
                        onChange={(e) => handleInputChange("calories", e.target.value)}
                        placeholder="Enter calories"
                    />
                    <Input
                        label="Heart Rate (bpm)"
                        type="number"
                        value={formData.heart_rate}
                        onChange={(e) => handleInputChange("heart_rate", e.target.value)}
                        placeholder="Enter heart rate"
                    />
                    <Input
                        label="Sleep (e.g., 6:30)"
                        value={formData.sleep}
                        onChange={(e) => handleInputChange("sleep", e.target.value)}
                        placeholder="Enter sleep duration"
                    />
                    <Button
                        className="bg-green-500 text-white"
                        onClick={handleUpdateSubmit}
                        disabled={!formData.walk || !formData.calories || !formData.heart_rate || !formData.sleep}
                    >
                        Update
                    </Button>
                </Box>
            </Modal>

            <Modal
                open={showFeedbackModal}
                title={isSuccess ? "Success" : "Error"}
                onCancel={() => setShowFeedbackModal(false)}
                footer={[
                    <Button
                        key="close"
                        className="bg-blue-500 text-white"
                        onClick={() => setShowFeedbackModal(false)}
                    >
                        Close
                    </Button>,
                ]}
                centered
            >
                <Text className={isSuccess ? "text-green-500" : "text-red-500"}>{feedbackMessage}</Text>
            </Modal>
        </Box>
    );
};

export default Dashboard;
