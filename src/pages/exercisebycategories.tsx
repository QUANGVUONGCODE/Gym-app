import React, { useState, useEffect } from "react";
import { Box, Button, Text, useParams } from "zmp-ui";
import { useAppNavigation } from "@/utils/navigation";
import { getToken } from "@/utils/user";
import Footer from "@/components/footer/footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFire, faClock } from "@fortawesome/free-solid-svg-icons";

function ExerciseByCategories() {
    const { id } = useParams<{ id: string }>();
    const [exercises, setExercises] = useState<
        { id: number; name: string; video_url: string; time: string; calories: string; level: string; image_url: string }[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [keyword, setKeyword] = useState<string>("");
    const { goToExerciseDetail, goback } = useAppNavigation();
    const token = getToken();

    const fetchExercises = async (id: number) => {
        if (loading) return;
        setLoading(true);
        setError(null);

        try {
            if (!token) {
                throw new Error("No authentication token found. Please log in.");
            }

            const url = `http://localhost:8080/gym/api/v1/exercises?category_id=${id}&keyword=${keyword}&page=0&limit=5`;

            const response = await fetch(url, {
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
                if (Array.isArray(data.result.exercises)) {
                    setExercises(data.result.exercises);
                } else if (data.result) {
                    setExercises([data.result]); // Wrap single object in an array
                }
            }
        } catch (error) {
            console.error("Error fetching exercises:", error);
            setError("Failed to fetch exercises");
        } finally {
            setLoading(false);
        }
    };

    const handleExerciseClick = (exerciseId: number) => {
        goToExerciseDetail(exerciseId);
    };

    useEffect(() => {
        if (id && !isNaN(parseInt(id))) {
            console.log("Fetching exercises for category ID:", id);
            fetchExercises(parseInt(id));
        } else {
            setError("Invalid or missing ID in URL");
        }
    }, [id, keyword]);

    return (
        <>
            <Box className="justify-center items-center mt-16">
                <Box className="flex justify-between items-center px-4">
                    <div
                        onClick={goback}
                        className="flex items-center justify-center bg-white rounded-full w-10 h-10 shadow-md cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-[24px] text-black" />
                    </div>
                    <Text className="text-[24px] font-bold mr-36">Exercises</Text>
                </Box>
            </Box>
            <Box className="my-6 px-6 mb-2">
                {/* Search box */}
                <Box className="px-6 mt-6">
                    <input
                        type="text"
                        placeholder="Search for exercises..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <Button className="mt-2 bg-blue-500 text-white p-2 rounded-lg w-full">Search</Button>
                </Box>

                {/* Exercises List */}
                <Box className="mt-6 px-6 space-y-3 mb-14">
                    {loading ? (
                        <Text>Loading...</Text>
                    ) : error ? (
                        <Text className="text-red-500">{error}</Text>
                    ) : exercises.length > 0 ? (
                        exercises.map((exercise, index) => (
                            <Box
                                key={`${exercise.id}-${index}`}
                                className="grid grid-cols-3 gap-3 border-b-2 border-gray-300 pb-4 mb-4"
                                onClick={() => handleExerciseClick(exercise.id)}
                            >
                                <Box>
                                    <img
                                        className="w-full h-auto max-w-[150px] max-h-[100px] border-2"
                                        src={
                                            exercise.image_url && exercise.image_url !== "null" && exercise.image_url !== ""
                                                ? exercise.image_url
                                                : "https://via.placeholder.com/300x200?text=No+Image"
                                        }
                                        alt={exercise.name}

                                    />
                                </Box>
                                <Box className="col-span-2">
                                    <Text className="font-semibold text-[16px]">{exercise.name}</Text>
                                    <Box className="flex items-center">
                                        <FontAwesomeIcon icon={faFire} className="text-yellow-400" />
                                        <Text className="text-sm text-gray-600 m-2">{exercise.calories} kcal</Text>
                                        <FontAwesomeIcon
                                            icon={faClock}
                                            className="text-red-400 pl-2 border-l border-gray-600"
                                        />
                                        <Text className="text-sm text-gray-600 ml-2">{exercise.time}</Text>
                                    </Box>
                                    <Text className="text-sm text-gray-600">{exercise.level}</Text>
                                </Box>
                            </Box>
                        ))
                    ) : (
                        <Text>No exercises available</Text>
                    )}
                </Box>

                <Footer />
            </Box>
        </>
    );
}

export default ExerciseByCategories;