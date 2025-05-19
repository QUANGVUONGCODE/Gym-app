import React, { useState, useEffect } from "react";
import { Box, Text, Button, useParams, useNavigate } from "zmp-ui";
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppNavigation } from "@/utils/navigation";
import { getToken } from "@/utils/user";
const ResultScreen = () => {
    const { id } = useParams<{ id: string }>(); // This is the workout plan ID
    const {goback, goToIndex} = useAppNavigation();
    // State to store fetched data
    const [exerciseName, setExerciseName] = useState<string>("");
    const [totalTime, setTotalTime] = useState<number>(0);
    const [calories, setCalories] = useState<number>(0);
    const [weight, setWeight] = useState<number>(0);
    const [exerciseLevel, setExerciseLevel] = useState<string>(""); // Replace heartRate with exercise level
    const [completedDate, setCompletedDate] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const token = getToken();
    if (!token) {
        throw new Error('No authentication token found. Please log in.');
    }

    // Fetch workout plan data
    useEffect(() => {
        const fetchWorkoutPlan = async () => {
            if (!id) {
                setError("Invalid workout plan ID");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:8080/gym/api/v1/workout-plans/${id}`, {
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
                    const workoutPlan = data.result;
                    setExerciseName(workoutPlan.exercise_id.name || "Unknown Exercise");
                    setTotalTime(workoutPlan.duration || 0);
                    setCalories(workoutPlan.exercise_id.calories || 0);
                    setWeight(workoutPlan.user_id.weight || 0);
                    setExerciseLevel(workoutPlan.exercise_id.level || "Unknown"); // Set exercise level
                    setCompletedDate(workoutPlan.exercise || new Date().toISOString().split('T')[0]);
                } else {
                    setError("Failed to fetch workout plan data");
                }
            } catch (err) {
                setError("Error fetching workout plan data");
                console.error("Error fetching workout plan:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkoutPlan();
    }, [id]);

    const handleSave = async () => {
        if (!id) {
            alert("Invalid workout plan ID");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/gym/api/v1/workout-plans/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ active: true }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.code === 0) {
                alert("Workout marked as completed!");
                goToIndex();
            } else {
                alert("Failed to save workout.");
            }
        } catch (error) {
            console.error("Error saving workout:", error);
            alert("Error saving workout.");
        }
    };

    const formatTime = (minutes: number) => {
        const mins = Math.floor(minutes);
        const secs = Math.floor((minutes % 1) * 60);
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    if (loading) return <Text className="p-4">Loading...</Text>;
    if (error) return <Text className="p-4">{error}</Text>;

    return (
        <Box className="h-screen bg-gray-100">
            <Box className="flex justify-between items-center px-4 pt-5">
                <div
                    onClick={goback}
                    className="flex items-center justify-center bg-white rounded-full w-10 h-10 shadow-md"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="text-[24px] text-black" />
                </div>
            </Box>
            <Box className="p-4">
                <Text className="text-2xl font-bold mb-2">RESULT</Text>
                <Text className="text-lg font-semibold">Workout</Text>
                <Text className="text-sm text-gray-600 mb-4">
                    {exerciseName}
                </Text>
                <Text className="text-sm text-gray-600 mb-4">
                    Completed on {new Date(completedDate).toLocaleDateString()}
                </Text>
                <Text className="text-lg font-semibold mb-2">Workout summary</Text>
                <Box className="grid grid-cols-2 gap-4 mb-6">
                    <Box className="bg-white rounded-lg p-4 shadow-md">
                        <Text className="text-sm text-gray-600">Total time</Text>
                        <Text className="text-lg font-bold">{formatTime(totalTime)} min</Text>
                    </Box>
                    <Box className="bg-white rounded-lg p-4 shadow-md">
                        <Text className="text-sm text-gray-600">Total calories</Text>
                        <Text className="text-lg font-bold">{calories} kcal</Text>
                    </Box>
                    <Box className="bg-white rounded-lg p-4 shadow-md">
                        <Text className="text-sm text-gray-600">Total weight</Text>
                        <Text className="text-lg font-bold">{weight} kg</Text>
                    </Box>
                    <Box className="bg-white rounded-lg p-4 shadow-md">
                        <Text className="text-sm text-gray-600">Level</Text>
                        <Text className="text-lg font-bold">{exerciseLevel}</Text>
                    </Box>
                </Box>
                <Button
                    className="w-full py-3 bg-green-500 text-white text-lg rounded-md"
                    onClick={handleSave}
                >
                    SAVE
                </Button>
            </Box>
        </Box>
    );
};

export default ResultScreen;