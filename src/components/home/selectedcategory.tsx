import React, { useState, useEffect } from "react";
import { Box, Text, Button, Avatar } from "zmp-ui";
import { useAppNavigation } from "@/utils/navigation"; // Import hook điều hướng
import { getToken } from "@/utils/user";


const CategoryList = () => {
  const [categories, setCategories] = useState<{ id: number; name: string; image_url: string }[]>([]);
  const { goToCategories, goToExerciseByCategoryId } = useAppNavigation();
  const fetchCategories = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }
      const response = await fetch("http://localhost:8080/gym/api/v1/categories/search?page=0&limit=6&keyword=", {
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
        setCategories(data.result.categories.map((category: { id: number; name: string; image_url: string }) => ({
          id: category.id,
          name: category.name,
          image_url: category.image_url 
        })));
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Box className="my-6 px-6">
      <Box className="flex justify-between items-center mb-4">
        <Text className="font-bold text-xl mb-4">Categories</Text>
        <Text className="font-bold mb-4 pointer "
          onClick={goToCategories}
        >See all
        </Text>
      </Box>
      <Box className="flex overflow-x-auto space-x-4 pb-2 snap-x snap-mandatory">
        {categories.length > 0 ? (
          categories.map((category) => (
            <Box key={category.id} flex flexDirection="column" alignItems="center" className="pointer"
              onClick={() => goToExerciseByCategoryId(category.id)}
            >
              <Avatar
                className="mb-2"
                size={61}
                // Giữ một hình ảnh mặc định cho tất cả các danh mục
                src={
                  category.image_url && category.image_url !== "null" && category.image_url !== ""
                    ? category.image_url
                    : "https://via.placeholder.com/300x200?text=No+Image"
                }
              />
              <Text className="font-semibold text-[14px]">{category.name}</Text>
            </Box>
          ))
        ) : (
          <Text>No categories available</Text>
        )}
      </Box>
    </Box>
  );
};

export default CategoryList;
