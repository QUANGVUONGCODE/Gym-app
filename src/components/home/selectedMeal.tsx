import React, { useState, useEffect } from "react";
import { Box, Text, Button } from "zmp-ui";
import { useAppNavigation } from "@/utils/navigation";
import { getToken } from "@/utils/user";
const SelectMeal = () => {
  const [meals, setMeals] = useState<{ id: number; name: string; calories: string; image_url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { goToMealPlan, goToMealDetail } = useAppNavigation();
  const fetchMeals = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
                  if (!token) {
                      throw new Error('No authentication token found. Please log in.');
                  }
                  const response = await fetch("http://localhost:8080/gym/api/v1/meals?keyword&page=0&limit=2", {
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
        setMeals(data.result.meals.map((meal: { id: number; name: string; calories: string; image_url: string }) => ({
          id: meal.id,
          name: meal.name,
          calories: meal.calories,
          image_url: meal.image_url,
        })));
      } else {
        setMeals([]);
      }
    } catch (error) {
      setError("Error fetching meals");
      console.error("Error fetching meals:", error);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseClick = (exerciseId) => {
    console.log("Navigating to exercise detail for ID:", exerciseId);
    goToMealDetail(exerciseId);  // Điều hướng đến chi tiết bài tập với id
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  return (
    <Box className="my-6 px-6 space-y-3">

      <Box className="flex justify-between items-center mb-4">
        <Text className="font-bold text-xl mb-4">Meal Plans</Text>
        <Text className="font-bold mb-4 pointer" onClick={goToMealPlan}>See all</Text>
      </Box>
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text className="text-red-500">{error}</Text>
      ) : meals.length > 0 ? (
        meals.map((meal) => (
          <Box key={meal.id} className="relative rounded-xl pointer"
            onClick={() => handleExerciseClick(meal.id)}
          >
            <Box className="w-full h-56">
              {/* Hiển thị ảnh bữa ăn */}
              <img
                src={"src/assets/meal-1.png"} // Sử dụng ảnh từ API hoặc ảnh mặc định
                alt={meal.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </Box>
            <Box className="absolute top-2 right-2"></Box>
            <Box className="mt-4 border-b-2 border-gray-300 pb-4 pointer">
              <Text className="font-semibold text-lg">{meal.name}</Text>
              <Box className="flex items-center">
                <Text className="text-sm text-gray-600 mr-2">{meal.calories} kcal</Text>
              </Box>
            </Box>
          </Box>
        ))
      ) : (
        <Text>No meals available</Text>
      )}
    </Box>
  );
};

export default SelectMeal;
