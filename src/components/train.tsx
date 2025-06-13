import React, { useState, useEffect } from "react";
import { Box, Text, Button, useParams } from "zmp-ui";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppNavigation } from "@/utils/navigation";
import { getToken } from "@/utils/user";

// Utility function to extract YouTube embed URL
const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url || url === "null" || url === "") return null;

    const youtubeRegex = [
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
        /youtube\.com\/embed\/([^"&?\/\s]{11})/,
    ];

    for (const regex of youtubeRegex) {
        const match = url.match(regex);
        if (match && match[1]) {
            return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
        }
    }

    return null;
};

const TrainScreen = () => {
    const { id } = useParams<{ id: string }>();
    const { goToResult, goback } = useAppNavigation();

    const [exercise, setExercise] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasStarted, setHasStarted] = useState<boolean>(false);
    const [workoutPlanId, setWorkoutPlanId] = useState<number | null>(null);
    const token = getToken();

    if (!token) {
        console.error("No authentication token found. Please log in.");
        return <Text className="text-red-500">Please log in to view this page.</Text>;
    }

    const fetchExercise = async (exerciseId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/gym/api/v1/exercises/${exerciseId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "Accept-Language": "vi",
                    "Origin": "http://localhost:3000",
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.code === 0 && data.result) {
                setExercise(data.result);
                console.log("Fetched exercise video URL:", data.result.video_url); // Debug log
                const timeInMinutes = parseInt(data.result.time) || 20;
                setTimeLeft(timeInMinutes * 60);
            } else {
                setError("No exercise data found");
            }
        } catch (error) {
            setError("Error fetching exercise");
            console.error("Error fetching exercise:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!id || isNaN(parseInt(id))) {
            setError("Invalid or missing exercise ID");
            setLoading(false);
            return;
        }
        fetchExercise(parseInt(id));
    }, [id]);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isRunning && timeLeft > 0 && exercise) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    console.log("Time left:", prev);
                    if (prev <= 1) {
                        setIsRunning(false);
                        try {
                            if (exercise?.id && workoutPlanId) {
                                console.log("Navigating to result with workout plan ID:", workoutPlanId);
                                goToResult(workoutPlanId);
                            } else {
                                throw new Error("Exercise ID or workout plan ID is missing");
                            }
                        } catch (err) {
                            console.error("Navigation error:", err);
                            setError("Failed to navigate to result screen");
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isRunning, timeLeft, exercise, goToResult, workoutPlanId]);

    const handleStart = async () => {
        setIsRunning(true);
        setHasStarted(true);

        const currentDate = new Date().toISOString().split("T")[0];
        const payload = {
            user_id: 1, // Replace with dynamic user ID (e.g., getUserId())
            exercise_id: exercise.id,
            date: currentDate,
            duration: parseInt(exercise.time) || 20,
        };

        try {
            const response = await fetch("http://localhost:8080/gym/api/v1/workout-plans", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.code === 0 && data.result) {
                setWorkoutPlanId(data.result.id);
                alert("Workout plan added successfully!");
            } else {
                alert("Failed to add workout plan.");
            }
        } catch (error) {
            console.error("Error adding to workout plan:", error);
            alert("Error adding to workout plan.");
        }
    };

    const handlePause = () => {
        setIsRunning(false);
    };

    const handleContinue = () => {
        setIsRunning(true);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text className="text-red-500">{error}</Text>;

    const embedUrl = getYouTubeEmbedUrl(exercise?.video_url);

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
                <Text className="text-xl font-bold mb-4">{exercise?.name || "Exercise"}</Text>

                {embedUrl ? (
                    <Box className="mb-4 aspect-w-16 aspect-h-9">
                        <iframe
                            width="100%"
                            height="100%"
                            src={embedUrl}
                            title="Exercise Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </Box>
                ) : (
                    <Box className="mb-4 flex justify-center items-center bg-gray-200 h-[200px]">
                        <Text className="text-gray-600">No video available</Text>
                    </Box>
                )}

                <Text className="text-sm text-gray-600">{exercise?.description || "No description available."}</Text>

                <Box className="flex justify-center items-center mb-4">
                    <Text className="text-4xl font-bold">{formatTime(timeLeft)}</Text>
                </Box>

                {!hasStarted ? (
                    <Button
                        className="w-full py-3 bg-green-500 text-white text-lg rounded-md"
                        onClick={handleStart}
                    >
                        START
                    </Button>
                ) : (
                    <Box className="flex gap-4">
                        <Button
                            className="w-full py-3 bg-yellow-500 text-white text-lg rounded-md"
                            onClick={handlePause}
                        >
                            PAUSE
                        </Button>
                        <Button
                            className="w-full py-3 bg-blue-500 text-white text-lg rounded-md"
                            onClick={handleContinue}
                        >
                            CONTINUE
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default TrainScreen;