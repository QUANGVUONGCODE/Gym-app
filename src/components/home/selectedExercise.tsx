import React, { useState, useEffect } from "react";
import { Box, Text, Button } from "zmp-ui";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHeart } from '@fortawesome/free-solid-svg-icons';

import { useAppNavigation } from "@/utils/navigation";
import { getToken } from "@/utils/user";

const SelectExercise = () => {
    const [exercises, setExercises] = useState<{ id: number; name: string; video_url: string, time: string; image_url: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { goToTranning, goToExerciseDetail, goback, goToExercise } = useAppNavigation(); // Hàm điều hướng

    const fetchExercises = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = getToken();
            if (!token) {
                throw new Error('No authentication token found. Please log in.');
            }
            const response = await fetch("http://localhost:8080/gym/api/v1/exercises?keyword&category_id&page=0&limit=5", {
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
                setExercises(data.result.exercises.map((exercise: { id: number; name: string; video_url: string, time: string, image_url: string }) => ({
                    id: exercise.id,
                    name: exercise.name,
                    video_url: exercise.video_url,
                    time: exercise.time,
                    image_url: exercise.image_url
                })));
            } else {
                setExercises([]);
            }
        } catch (error) {
            setError("Error fetching exercises");
            console.error("Error fetching exercises:", error);
            setExercises([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExercises();
    }, []);


    const handleExerciseClick = (exerciseId) => {
        console.log("Navigating to exercise detail for ID:", exerciseId);
        goToExerciseDetail(exerciseId);  // Điều hướng đến chi tiết bài tập với id
    };

    return (
        <>
            <Box className="my-6 px-6 space-y-3">
                <Box className="flex justify-between items-center mb-4">
                    <Text className="font-bold text-xl mb-4">Popular Exercises</Text>

                    <Text className="font-bold mb-4 pointer " onClick={goToExercise}>See all</Text>
                </Box>
                {loading ? (
                    <Text>Loading...</Text>
                ) : error ? (
                    <Text className="text-red-500">{error}</Text>
                ) : exercises.length > 0 ? (
                    exercises.map((exercise) => (
                        <Box key={exercise.id} className="relative rounded-xl pointer"
                            onClick={() => {
                                handleExerciseClick(exercise.id);
                            }}>
                            <Box className="w-full h-56">
                                <img
                                    src={
                                        exercise.image_url && exercise.image_url !== "null" && exercise.image_url !== ""
                                            ? exercise.image_url
                                            : "https://via.placeholder.com/300x200?text=No+Image"
                                    }
                                    alt={exercise.name}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </Box>

                            <Box className="mt-4 border-b-2 border-gray-300 pb-4">
                                <Text className="font-semibold text-lg">{exercise.name}</Text>
                                <Box className="flex items-center">
                                    <Text className="text-sm text-gray-600 mr-2">Beginner</Text>
                                    <i className="fa fa-clock text-green-400 pl-1 border-l border-gray-600"></i>
                                    <Text className="text-sm text-gray-600 ml-2"> {exercise.time}</Text>
                                </Box>
                            </Box>
                        </Box>
                    ))
                ) : (
                    <Text>No exercises available</Text>
                )}
            </Box>
        </>
    );
};

export default SelectExercise;
