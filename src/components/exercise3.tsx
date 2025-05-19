import { getToken } from "@/utils/user";
import React, { useState, useEffect } from "react";
import { Box, Text, Button } from "zmp-ui";


const SelectExercise3 = () => {
    const [exercises, setExercises] = useState<{ id: number; name: string; video_url: string; time: string; calories: string; level: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const token = getToken();
    if(!token){
        throw new Error('No authentication token found. Please log in.');
    }
    const fetchExercises = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("http://localhost:8080/gym/api/v1/exercises?keyword&category_id&page=1&limit=5", {
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
                setExercises(data.result.exercises.map((exercise: { id: number; name: string; video_url: string; time: string; calories: string; level: string }) => ({
                    id: exercise.id,
                    name: exercise.name,
                    video_url: exercise.video_url,
                    time: exercise.time,
                    calories: exercise.calories,
                    level: exercise.level,
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

    return (
        <Box className="mt-6 px-6 space-y-3 mb-14">
            <Box className="flex justify-between items-center mb-4">
                <Text className="font-bold text-xl mb-4">Just for you</Text>
            </Box>

            {loading ? (
                <Text>Loading...</Text>
            ) : error ? (
                <Text className="text-red-500">{error}</Text>
            ) : exercises.length > 0 ? (
                <Box className="flex overflow-x-auto space-x-6 pb-2 snap-x snap-mandatory">
                    {exercises.map((exercise) => (
                        <Box key={exercise.id} className="flex-none w-28 h-40 bg-cover rounded-lg" style={{ backgroundImage: `url('/src/assets/exercise-1.png')` }}>
                            <Box className="w-full bg-gradient-to-t from-white to-transparent rounded-lg p-2">
                                <Text className="font-bold text-sm">{exercise.name}</Text>
                                <Box className="flex items-center">
                                    <i className="fa fa-clock text-green-600 mr-1 "></i>
                                    <Text className="text-sm font-medium">{exercise.time}</Text>
                                </Box>
                                <Text className="text-sm font-medium">{exercise.calories} kcal</Text>
                            </Box>
                        </Box>
                    ))}
                </Box>
            ) : (
                <Text>No exercises available</Text>
            )}
        </Box>
    );
};

export default SelectExercise3;