import React, { useState, useEffect } from "react";
import { Box, Text, Button } from "zmp-ui";
import { useAppNavigation } from "@/utils/navigation";
import { getToken } from "@/utils/user";

const SelectExercise2 = () => {
  const [exercises, setExercises] = useState<{ id: number; name: string; video_url: string; time: string; calories: string; level: string; image_url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { goToExercise, goToExerciseDetail } = useAppNavigation();
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
        setExercises(data.result.exercises.map((exercise: { id: number; name: string; video_url: string; time: string; calories: string; level: string; image_url: string }) => ({
          id: exercise.id,
          name: exercise.name,
          video_url: exercise.video_url,
          time: exercise.time,
          calories: exercise.calories,
          level: exercise.level,
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

  const handleExerciseClick = (exerciseId) => {
    console.log("Navigating to exercise detail for ID:", exerciseId);
    goToExerciseDetail(exerciseId);  // Điều hướng đến chi tiết bài tập với id
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  return (
    <Box className="mt-6 px-6 space-y-3 mb-14">
      <Box className="flex justify-between items-center mb-4">
        <Text className="font-bold text-xl mb-4">Additional Exercise</Text>
        <Text className="font-bold mb-4 pointer" onClick={goToExercise}>See all</Text>
      </Box>

      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text className="text-red-500">{error}</Text>
      ) : exercises.length > 0 ? (
        exercises.map((exercise) => (
          <Box key={exercise.id}
            className="grid grid-cols-3 gap-3 border-b-2 border-gray-300 pb-4 mb-4 pointer"
            onClick={() => {
              handleExerciseClick(exercise.id);
            }}
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
                <i className="fa fa-fire text-green-400 "></i>
                <Text className="text-sm text-gray-600 m-2">{exercise.calories} kcal</Text>
                <i className="fa fa-clock text-green-400 pl-2 border-l border-gray-600"></i>
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
  );
};

export default SelectExercise2;
