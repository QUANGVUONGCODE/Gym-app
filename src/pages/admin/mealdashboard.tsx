import React, { useState, useEffect } from "react";
import { Box, Button, Text, Modal, Input } from "zmp-ui";
import { getToken } from "@/utils/user";

interface Meal {
  id: number;
  name: string;
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
  image_url: string | null;
}

const MealList = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [limit] = useState<number>(10);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [formData, setFormData] = useState<Partial<Meal>>({});

  // Hàm gọi API để lấy tổng số bữa ăn
  const fetchTotalMeals = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch("http://localhost:8080/gym/api/v1/meals/count", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Accept-Language": "vi",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Total Meals API Response:", data);

      if (data.code === 0 && data.result !== undefined) {
        setTotalItems(data.result);
      } else {
        console.error("No total meals data found");
      }
    } catch (error) {
      console.error("Error fetching total meals:", error);
    }
  };

  // Hàm gọi API để lấy danh sách bữa ăn
  const fetchMeals = async (pageNumber: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch(
        `http://localhost:8080/gym/api/v1/meals?keyword=&page=${pageNumber}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "Accept-Language": "vi",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Meal API Response Data:", data);

      if (data.code === 0 && data.result && Array.isArray(data.result.meals)) {
        const newMeals = data.result.meals;
        setMeals(newMeals);
        setHasMore(newMeals.length === limit && (pageNumber + 1) * limit < totalItems);
      } else {
        setError("No meals data found");
        setMeals([]);
        setHasMore(false);
      }
    } catch (error) {
      setError("Error fetching meals");
      console.error("Error fetching meals:", error);
      setMeals([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Hàm gọi API để thêm bữa ăn mới
  const addMeal = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      // Validate formData
      if (!formData.name || !formData.calories || !formData.fat || !formData.carbs || !formData.protein) {
        setError("Vui lòng điền đầy đủ các trường bắt buộc");
        return;
      }

      const payload = {
        name: formData.name,
        calories: Number(formData.calories),
        fat: Number(formData.fat),
        carbs: Number(formData.carbs),
        protein: Number(formData.protein),
        image_url: formData.image_url || null,
      };

      const response = await fetch("http://localhost:8080/gym/api/v1/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Accept-Language": "vi",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || "Unknown error"}`);
      }

      const data = await response.json();
      console.log("Add Meal API Response:", data);

      if (data.code === 0) {
        setIsAddModalOpen(false);
        setFormData({});
        fetchMeals(page);
        fetchTotalMeals();
      } else {
        setError("Failed to add meal: " + data.message);
      }
    } catch (error) {
      setError("Error adding meal: ");
      console.error("Error adding meal:", error);
    }
  };

  // Hàm gọi API để sửa bữa ăn
  const updateMeal = async () => {
    if (!selectedMeal) return;

    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      // Validate formData
      if (!formData.name || !formData.calories || !formData.fat || !formData.carbs || !formData.protein) {
        setError("Vui lòng điền đầy đủ các trường bắt buộc");
        return;
      }

      const payload = {
        name: formData.name,
        calories: Number(formData.calories),
        fat: Number(formData.fat),
        carbs: Number(formData.carbs),
        protein: Number(formData.protein),
        image_url: formData.image_url || null,
      };

      const response = await fetch(
        `http://localhost:8080/gym/api/v1/meals/${selectedMeal.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "Accept-Language": "vi",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || "Unknown error"}`);
      }

      const data = await response.json();
      console.log("Update Meal API Response:", data);

      if (data.code === 0) {
        setIsEditModalOpen(false);
        fetchMeals(page);
        fetchTotalMeals();
      } else {
        setError("Failed to update meal: " + data.message);
      }
    } catch (error) {
      setError("Error updating meal: ");
      console.error("Error updating meal:", error);
    }
  };

  // Hàm gọi API để xóa bữa ăn
  const deleteMeal = async (id: number) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch(`http://localhost:8080/gym/api/v1/meals/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Accept-Language": "vi",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || "Unknown error"}`);
      }

      const data = await response.json();
      console.log("Delete Meal API Response:", data);

      if (data.code === 0) {
        fetchMeals(page);
        fetchTotalMeals();
      } else {
        setError("Failed to delete meal: " + data.message);
      }
    } catch (error) {
      setError("Error deleting meal: " );
      console.error("Error deleting meal:", error);
    }
  };

  // Hàm mở modal chỉnh sửa và điền dữ liệu form
  const openEditModal = (meal: Meal) => {
    console.log("Selected Meal:", meal);
    setSelectedMeal(meal);
    setFormData({
      name: meal.name,
      calories: meal.calories,
      fat: meal.fat,
      carbs: meal.carbs,
      protein: meal.protein,
      image_url: meal.image_url,
    });
    setIsEditModalOpen(true);
  };

  // Hàm mở modal thêm bữa ăn
  const openAddModal = () => {
    setFormData({
      name: "",
      calories: 0,
      fat: 0,
      carbs: 0,
      protein: 0,
      image_url: "",
    });
    setIsAddModalOpen(true);
  };

  // Hàm xử lý thay đổi input trong form
  const handleInputChange = (field: keyof Meal, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    fetchTotalMeals();
    fetchMeals(page);
  }, [page]);

  const totalPages = Math.ceil(totalItems / limit);
  const maxPageButtons = 10;
  const pageNumbers = Array.from(
    { length: Math.min(totalPages, maxPageButtons) },
    (_, index) => index
  );

  const goToPreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
      console.log("Go to Previous Page:", page - 1, "Displayed Page:", page);
    }
  };

  const goToNextPage = () => {
    if (hasMore) {
      setPage(page + 1);
      console.log("Go to Next Page:", page + 1, "Displayed Page:", page + 2);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setPage(pageNumber);
      console.log("Go to Page:", pageNumber, "Displayed Page:", pageNumber + 1);
    }
  };

  return (
    <Box className="p-6">
      <Box className="flex justify-between items-center mb-4">
        <Text className="font-bold text-xl">Meal List</Text>
        <Button
          onClick={openAddModal}
          className="py-2 px-4 bg-green-500 text-white rounded-md text-sm"
        >
          Thêm bữa ăn
        </Button>
      </Box>

      {error && <Text className="text-red-500">{error}</Text>}

      {loading && meals.length === 0 ? (
        <Box className="flex justify-center items-center">
          <Text>Loading...</Text>
        </Box>
      ) : (
        <>
          {meals.length > 0 ? (
            <Box className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="py-2 px-4 border-b text-left">ID</th>
                    <th className="py-2 px-4 border-b text-left">Name</th>
                    <th className="py-2 px-4 border-b text-left">Calories</th>
                    <th className="py-2 px-4 border-b text-left">Fat</th>
                    <th className="py-2 px-4 border-b text-left">Carbs</th>
                    <th className="py-2 px-4 border-b text-left">Protein</th>
                    <th className="py-2 px-4 border-b text-left">Image URL</th>
                    <th className="py-2 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meals.map((meal) => (
                    <tr
                      key={meal.id}
                      className={`hover:bg-gray-100 ${selectedMeal?.id === meal.id ? "bg-blue-100" : ""}`}
                    >
                      <td className="py-2 px-4 border-b">{meal.id}</td>
                      <td className="py-2 px-4 border-b">{meal.name}</td>
                      <td className="py-2 px-4 border-b">{meal.calories}</td>
                      <td className="py-2 px-4 border-b">{meal.fat}</td>
                      <td className="py-2 px-4 border-b">{meal.carbs}</td>
                      <td className="py-2 px-4 border-b">{meal.protein}</td>
                      <td className="py-2 px-4 border-b">
                        {meal.image_url ? (
                          <a
                            href={meal.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Link
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="py-2 px-4 border-b flex space-x-2">
                        <Button
                          onClick={() => openEditModal(meal)}
                          className="py-1 px-2 bg-blue-500 text-white rounded-md text-xs"
                        >
                          Sửa
                        </Button>
                        <Button
                          onClick={() => deleteMeal(meal.id)}
                          className="py-1 px-2 bg-red-500 text-white rounded-md text-xs"
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          ) : (
            <Text className="text-sm text-gray-600">No meals available</Text>
          )}

          {/* Modal chỉnh sửa bữa ăn */}
          <Modal
            visible={isEditModalOpen}
            title="Chỉnh sửa bữa ăn"
            onClose={() => setIsEditModalOpen(false)}
            actions={[
              {
                text: "Hủy",
                onClick: () => setIsEditModalOpen(false),
              },
              {
                text: "Lưu",
                onClick: updateMeal,
                highLight: true,
              },
            ]}
          >
            <Box className="space-y-4">
              <Input
                label="Tên bữa ăn"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nhập tên bữa ăn"
              />
              <Input
                label="Calories"
                type="number"
                value={formData.calories?.toString() || ""}
                onChange={(e) => handleInputChange("calories", e.target.value ? parseFloat(e.target.value) : 0)}
                placeholder="Nhập số calories"
              />
              <Input
                label="Fat (g)"
                type="number"
                value={formData.fat?.toString() || ""}
                onChange={(e) => handleInputChange("fat", e.target.value ? parseFloat(e.target.value) : 0)}
                placeholder="Nhập lượng fat (g)"
              />
              <Input
                label="Carbs (g)"
                type="number"
                value={formData.carbs?.toString() || ""}
                onChange={(e) => handleInputChange("carbs", e.target.value ? parseFloat(e.target.value) : 0)}
                placeholder="Nhập lượng carbs (g)"
              />
              <Input
                label="Protein (g)"
                type="number"
                value={formData.protein?.toString() || ""}
                onChange={(e) => handleInputChange("protein", e.target.value ? parseFloat(e.target.value) : 0)}
                placeholder="Nhập lượng protein (g)"
              />
              <Input
                label="Image URL"
                value={formData.image_url || ""}
                onChange={(e) => handleInputChange("image_url", e.target.value || null)}
                placeholder="Nhập URL hình ảnh"
              />
            </Box>
          </Modal>

          {/* Modal thêm bữa ăn */}
          <Modal
            visible={isAddModalOpen}
            title="Thêm bữa ăn mới"
            onClose={() => setIsAddModalOpen(false)}
            actions={[
              {
                text: "Hủy",
                onClick: () => setIsAddModalOpen(false),
              },
              {
                text: "Thêm",
                onClick: addMeal,
                highLight: true,
              },
            ]}
          >
            <Box className="space-y-4">
              <Input
                label="Tên bữa ăn"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nhập tên bữa ăn"
              />
              <Input
                label="Calories"
                type="number"
                value={formData.calories?.toString() || ""}
                onChange={(e) => handleInputChange("calories", e.target.value ? parseFloat(e.target.value) : 0)}
                placeholder="Nhập số calories"
              />
              <Input
                label="Fat (g)"
                type="number"
                value={formData.fat?.toString() || ""}
                onChange={(e) => handleInputChange("fat", e.target.value ? parseFloat(e.target.value) : 0)}
                placeholder="Nhập lượng fat (g)"
              />
              <Input
                label="Carbs (g)"
                type="number"
                value={formData.carbs?.toString() || ""}
                onChange={(e) => handleInputChange("carbs", e.target.value ? parseFloat(e.target.value) : 0)}
                placeholder="Nhập lượng carbs (g)"
              />
              <Input
                label="Protein (g)"
                type="number"
                value={formData.protein?.toString() || ""}
                onChange={(e) => handleInputChange("protein", e.target.value ? parseFloat(e.target.value) : 0)}
                placeholder="Nhập lượng protein (g)"
              />
              <Input
                label="Image URL"
                value={formData.image_url || ""}
                onChange={(e) => handleInputChange("image_url", e.target.value || null)}
                placeholder="Nhập URL hình ảnh"
              />
            </Box>
          </Modal>

          {/* Thanh điều hướng */}
          {totalItems > 0 && (
            <Box className="flex justify-center items-center mt-6 space-x-0.5">
              <Button
                onClick={goToPreviousPage}
                disabled={page === 0}
                className="py-0.5 px-2 bg-gray-300 text-black rounded-md text-xs disabled:opacity-50"
              >
                Previous
              </Button>

              {pageNumbers.map((pageNumber) => (
                <Button
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  className={`py-0.5 px-2 rounded-md text-xs ${
                    page === pageNumber
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-black"
                  }`}
                >
                  {pageNumber + 1}
                </Button>
              ))}

              <Button
                onClick={goToNextPage}
                disabled={!hasMore}
                className="py-0.5 px-2 bg-gray-300 text-black rounded-md text-xs disabled:opacity-50"
              >
                Next
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default MealList;