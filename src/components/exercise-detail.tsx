import React, { useState, useEffect } from "react";
import { Box, Text, useParams, Button, Input } from "zmp-ui";
import { Modal, DatePicker } from "antd";
import Footer from "./footer/footer";
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppNavigation } from "@/utils/navigation";
import dayjs from "dayjs"; // For handling dates with Ant Design's DatePicker
import { getToken, getUserId } from "@/utils/user";

const ExerciseDetail1 = () => {
    const { id } = useParams<{ id: string }>();
    const { goback, goToTrainPage } = useAppNavigation();

    const [exerciseDetail, setExerciseDetail] = useState<any>(null);
    const [categoryName, setCategoryName] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<any>(null); // Ant Design DatePicker uses a different date object
    const [duration, setDuration] = useState<number>(20); // Default duration
    const token = getToken();
    if (!token) {
        console.error("No authentication token found. Please log in.");
        return null;
    }
    const fetchExerciseDetail = async (exerciseId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/gym/api/v1/exercises/${exerciseId}`, {
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
                setExerciseDetail(data.result);
                if (data.result.category_id) {
                    await fetchCategoryName(data.result.category_id);
                } else {
                    setCategoryName("N/A");
                }
            } else {
                setError("No exercise data found");
            }
        } catch (error) {
            setError("Error fetching exercise detail");
            console.error("Error fetching exercise detail:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryName = async (categoryId: number) => {
        try {
            const response = await fetch(`http://localhost:8080/gym/api/v1/categories/${categoryId}`, {
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
                setCategoryName(data.result.name);
            } else {
                setCategoryName("N/A");
            }
        } catch (error) {
            console.error("Error fetching category name:", error);
            setCategoryName("N/A");
        }
    };

    useEffect(() => {
        if (id && !isNaN(parseInt(id))) {
            fetchExerciseDetail(parseInt(id));
        } else {
            setError("Invalid or missing ID in URL");
        }
    }, [id]);

    const handleAddToPlan = async () => {
        if (!selectedDate || duration <= 0) {
            alert("Please select a date and set a valid duration");
            return;
        }

        const formattedDate = selectedDate.format("YYYY-MM-DD"); // Format the date for the API

        const payload = {
            user_id: getUserId(),
            exercise_id: exerciseDetail.id,
            date: formattedDate,
            duration: duration,
        };

        try {
            const response = await fetch("http://localhost:8080/gym/api/v1/workout-plans", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.code === 0) {
                alert("Workout plan added successfully!");
                setModalVisible(false);
            } else {
                alert("Failed to add workout plan.");
            }
        } catch (error) {
            console.error("Error adding to plan:", error);
            alert("Error adding to plan.");
        }
    };

    const handleTrain = () => {
        // Ensure id is defined and valid before parsing
        console.log("Navigating to training page for ID:", id);
        if (!id || isNaN(parseInt(id))) {
            alert("Invalid exercise ID. Cannot proceed to training.");
            return;
        }
        goToTrainPage(parseInt(id));
    };

    // Handle modal cancel/close
    const handleCancel = () => {
        setModalVisible(false);
        setSelectedDate(null); // Reset the date
        setDuration(20); // Reset the duration
    };

    const backgroundImageUrl =
        exerciseDetail?.image_url && exerciseDetail.image_url !== "null" && exerciseDetail.image_url !== ""
            ? exerciseDetail.image_url
            : "/src/assets/exercise-1.png";

    return (
        <>
            {loading && <Text>Loading...</Text>}
            {error && <Text>{error}</Text>}
            {!loading && !error && (
                <>
                    <Box
                        className="h-[380px]"
                        style={{
                            backgroundImage: `url(${backgroundImageUrl})`,
                            backgroundSize: "cover",
                        }}
                    >
                        <Box className="justify-center items-center pointer">
                            <Box className="flex justify-between items-center px-4 pt-5">
                                <div
                                    onClick={goback}
                                    className="flex items-center justify-center bg-white rounded-full w-10 h-10 shadow-md mt-5"
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} className="text-[24px] text-black" />
                                </div>
                            </Box>
                        </Box>
                    </Box>
                    <Box className="px-6 space-y-6 mb-9 bg-white">
                        <Box className="bg-white rounded-lg shadow-md p-4 relative top-[-50px]">
                            <Box className="grid grid-cols-3 gap-3 px-4">
                                <Box className="flex items-center gap-2 text-[24px] font-bold">
                                    <i className="fa-solid fa-fire"></i>
                                    <Text className="text-[16px] font-bold">
                                        {exerciseDetail?.calories || "N/A"} kcal
                                    </Text>
                                </Box>
                                <Box className="border-x-2 w-0 justify-self-center"></Box>
                                <Box className="flex items-center gap-2 text-[24px] font-bold">
                                    <i className="fa-solid fa-clock"></i>
                                    <Text className="text-[16px] font-bold">
                                        {exerciseDetail?.time || "N/A"}
                                    </Text>
                                </Box>
                            </Box>
                            <Box className="grid grid-cols-2 gap-6 mt-4">
                                <Box flex flexDirection="column" alignContent="center" className="gap-2">
                                    <Text className="text-sm text-gray-600">Category</Text>
                                    <Text className="bg-gray-200 py-4 px-8 rounded-lg font-bold">
                                        {categoryName || "N/A"}
                                    </Text>
                                </Box>
                                <Box flex flexDirection="column" alignContent="center" className="gap-2">
                                    <Text className="text-sm text-gray-600">Level</Text>
                                    <Text className="bg-gray-200 py-4 px-8 rounded-lg font-bold">
                                        {exerciseDetail?.level || "N/A"}
                                    </Text>
                                </Box>
                            </Box>
                            <Text className="text-xl font-semibold mt-4">
                                {exerciseDetail?.name || "Untitled Exercise"}
                            </Text>
                            <Text className="text-sm text-gray-600 mt-2">
                                {exerciseDetail?.description || "No description available."}
                            </Text>
                            <Box className="mt-6 flex gap-4">
                                <Button
                                    className="w-full py-3 bg-green-500 text-white text-lg rounded-md"
                                    onClick={() => setModalVisible(true)}
                                >
                                    ADD TO PLAN
                                </Button>
                                <Button
                                    className="w-full py-3 bg-blue-500 text-white text-lg rounded-md"
                                    onClick={handleTrain}

                                >
                                    TRAIN
                                </Button>
                            </Box>
                        </Box>
                    </Box>

                    {/* Modal for Add to Plan */}
                    <Modal
                        title="Add to Plan"
                        open={modalVisible}
                        onCancel={handleCancel}
                        footer={null}
                    >
                        <Box className="space-y-4">
                            <Box>
                                <Text>Select Date</Text>
                                <DatePicker
                                    value={selectedDate}
                                    onChange={(date) => setSelectedDate(date)}
                                    format="YYYY-MM-DD"
                                    style={{ width: "100%" }}
                                />
                            </Box>
                            <Box>
                                <Text>Duration (minutes)</Text>
                                <Input
                                    type="number"
                                    value={duration.toString()}
                                    onChange={(e) => setDuration(parseInt(e.target.value))}
                                    placeholder="Enter duration in minutes"
                                />
                            </Box>
                            <Box className="flex gap-4">
                                <Button
                                    className="w-full py-3 bg-gray-300 text-black text-lg rounded-md"
                                    onClick={handleCancel}
                                >
                                    CANCEL
                                </Button>
                                <Button
                                    className="w-full py-3 bg-green-500 text-white text-lg rounded-md"
                                    onClick={handleAddToPlan}
                                >
                                    DONE
                                </Button>
                            </Box>
                        </Box>
                    </Modal>

                    <Footer />
                </>
            )}
        </>
    );
};

export default ExerciseDetail1;