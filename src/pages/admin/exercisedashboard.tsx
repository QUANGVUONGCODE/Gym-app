import React, { useState, useEffect } from "react";
import { Box, Button, Text, Modal, Input } from "zmp-ui";
import { getToken } from "@/utils/user";

interface Exercise {
    id: number;
    name: string;
    description: string;
    video_url: string;
    category_id: number | null;
    time: string;
    calories: number;
    level: string;
    image_url: string | null;
}

const ExerciseList = () => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [limit] = useState<number>(10);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [formData, setFormData] = useState<Partial<Exercise>>({});

    // Hàm gọi API để lấy tổng số bài tập
    const fetchTotalExercises = async () => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error("No authentication token found. Please log in.");
            }

            const response = await fetch("http://localhost:8080/gym/api/v1/exercises/count", {
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
            console.log("Total Exercises API Response:", data);

            if (data.code === 0 && data.result !== undefined) {
                setTotalItems(data.result);
            } else {
                console.error("No total exercises data found");
            }
        } catch (error) {
            console.error("Error fetching total exercises:", error);
        }
    };

    // Hàm gọi API để lấy danh sách bài tập
    const fetchExercises = async (pageNumber: number) => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            if (!token) {
                throw new Error("No authentication token found. Please log in.");
            }

            const response = await fetch(
                `http://localhost:8080/gym/api/v1/exercises?keyword=&category_id=&page=${pageNumber}&limit=${limit}`,
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
            console.log("Exercise API Response Data:", data);

            if (data.code === 0 && data.result && Array.isArray(data.result.exercises)) {
                const newExercises = data.result.exercises.map((exercise: any) => ({
                    ...exercise,
                    category_id: exercise.category_id?.id || null, // Trích xuất id từ category_id
                }));
                setExercises(newExercises);
                setHasMore(newExercises.length === limit && (pageNumber + 1) * limit < totalItems);
            } else {
                setError("No exercises data found");
                setExercises([]);
                setHasMore(false);
            }
        } catch (error) {
            setError("Error fetching exercises");
            console.error("Error fetching exercises:", error);
            setExercises([]);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    // Hàm gọi API để thêm bài tập mới
    const addExercise = async () => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error("No authentication token found. Please log in.");
            }

            const response = await fetch("http://localhost:8080/gym/api/v1/exercises", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    "Accept-Language": "vi",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Add Exercise API Response:", data);

            if (data.code === 0) {
                setIsAddModalOpen(false);
                setFormData({}); // Reset form sau khi thêm
                fetchExercises(page); // Làm mới danh sách
                fetchTotalExercises(); // Cập nhật tổng số bài tập
            } else {
                setError("Failed to add exercise");
            }
        } catch (error) {
            setError("Error adding exercise");
            console.error("Error adding exercise:", error);
        }
    };

    // Hàm gọi API để sửa bài tập
    const updateExercise = async () => {
        if (!selectedExercise) return;

        try {
            const token = getToken();
            if (!token) {
                throw new Error("No authentication token found. Please log in.");
            }

            const response = await fetch(
                `http://localhost:8080/gym/api/v1/exercises/${selectedExercise.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        "Accept-Language": "vi",
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Update Exercise API Response:", data);

            if (data.code === 0) {
                setIsEditModalOpen(false);
                fetchExercises(page); // Làm mới danh sách sau khi sửa
                fetchTotalExercises(); // Cập nhật lại tổng số bài tập
            } else {
                setError("Failed to update exercise");
            }
        } catch (error) {
            setError("Error updating exercise");
            console.error("Error updating exercise:", error);
        }
    };

    // Hàm gọi API để xóa bài tập
    const deleteExercise = async (id: number) => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error("No authentication token found. Please log in.");
            }

            const response = await fetch(`http://localhost:8080/gym/api/v1/exercises/${id}`, {
                method: "DELETE",
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
            console.log("Delete Exercise API Response:", data);

            if (data.code === 0) {
                fetchExercises(page); // Làm mới danh sách sau khi xóa
                fetchTotalExercises(); // Cập nhật lại tổng số bài tập
            } else {
                setError("Failed to delete exercise");
            }
        } catch (error) {
            setError("Error deleting exercise");
            console.error("Error deleting exercise:", error);
        }
    };

    // Hàm mở modal chỉnh sửa và điền dữ liệu form
    const openEditModal = (exercise: Exercise) => {
        setSelectedExercise(exercise);
        setFormData({
            name: exercise.name,
            description: exercise.description,
            video_url: exercise.video_url,
            category_id: exercise.category_id,
            time: exercise.time,
            calories: exercise.calories,
            level: exercise.level,
            image_url: exercise.image_url,
        });
        setIsEditModalOpen(true);
    };

    // Hàm mở modal thêm bài tập
    const openAddModal = () => {
        setFormData({
            name: "",
            description: "",
            video_url: "",
            category_id: null,
            time: "",
            calories: 0,
            level: "",
            image_url: "",
        });
        setIsAddModalOpen(true);
    };

    // Hàm xử lý thay đổi input trong form
    const handleInputChange = (field: keyof Exercise, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        fetchTotalExercises();
        fetchExercises(page);
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

    // Danh sách tùy chọn cho select
    const levelOptions = [
        { value: "Beginner", label: "Beginner" },
        { value: "Intermediate", label: "Intermediate" },
        { value: "Advanced", label: "Advanced" },
    ];

    return (
        <Box className="p-6">
            <Box className="flex justify-between items-center mb-4">
                <Text className="font-bold text-xl">Exercise List</Text>
                <Button
                    onClick={openAddModal}
                    className="py-2 px-4 bg-green-500 text-white rounded-md text-sm"
                >
                    Thêm bài tập
                </Button>
            </Box>

            {error && <Text className="text-red-500">{error}</Text>}

            {loading && exercises.length === 0 ? (
                <Box className="flex justify-center items-center">
                    <Text>Loading...</Text>
                </Box>
            ) : (
                <>
                    {exercises.length > 0 ? (
                        <Box className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="py-2 px-4 border-b text-left">ID</th>
                                        <th className="py-2 px-4 border-b text-left">Name</th>
                                        <th className="py-2 px-4 border-b text-left">Description</th>
                                        <th className="py-2 px-4 border-b text-left">Video URL</th>
                                        <th className="py-2 px-4 border-b text-left">Category ID</th>
                                        <th className="py-2 px-4 border-b text-left">Time</th>
                                        <th className="py-2 px-4 border-b text-left">Calories</th>
                                        <th className="py-2 px-4 border-b text-left">Level</th>
                                        <th className="py-2 px-4 border-b text-left">Image URL</th>
                                        <th className="py-2 px-4 border-b text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exercises.map((exercise) => (
                                        <tr
                                            key={exercise.id}
                                            className={`hover:bg-gray-100 ${selectedExercise?.id === exercise.id ? "bg-blue-100" : ""}`}
                                            onClick={() => openEditModal(exercise)}
                                        >
                                            <td className="py-2 px-4 border-b">{exercise.id}</td>
                                            <td className="py-2 px-4 border-b">{exercise.name}</td>
                                            <td className="py-2 px-4 border-b">{exercise.description}</td>
                                            <td className="py-2 px-4 border-b">
                                                <a
                                                    href={exercise.video_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline"
                                                >
                                                    Link
                                                </a>
                                            </td>
                                            <td className="py-2 px-4 border-b">{exercise.category_id || "N/A"}</td>
                                            <td className="py-2 px-4 border-b">{exercise.time}</td>
                                            <td className="py-2 px-4 border-b">{exercise.calories}</td>
                                            <td className="py-2 px-4 border-b">{exercise.level}</td>
                                            <td className="py-2 px-4 border-b">
                                                {exercise.image_url ? (
                                                    <a
                                                        href={exercise.image_url}
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
                                            <td className="py-6 px-4 border-b flex space-x-2">
                                                <Button
                                                    onClick={() => openEditModal(exercise)}
                                                    className="py-1 px-2 bg-blue-500 text-white rounded-md text-xs"
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    onClick={() => deleteExercise(exercise.id)}
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
                        <Text className="text-sm text-gray-600">No exercises available</Text>
                    )}

                    {/* Modal chỉnh sửa bài tập */}
                    <Modal
                        visible={isEditModalOpen}
                        title="Chỉnh sửa bài tập"
                        onClose={() => setIsEditModalOpen(false)}
                        actions={[
                            {
                                text: "Hủy",
                                onClick: () => setIsEditModalOpen(false),
                            },
                            {
                                text: "Lưu",
                                onClick: updateExercise,
                                highLight: true,
                            },
                        ]}
                    >
                        <Box className="space-y-4">
                            <Input
                                label="Tên bài tập"
                                value={formData.name || ""}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="Nhập tên bài tập"
                            />
                            <Input
                                label="Mô tả"
                                value={formData.description || ""}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="Nhập mô tả"
                            />
                            <Input
                                label="Video URL"
                                value={formData.video_url || ""}
                                onChange={(e) => handleInputChange("video_url", e.target.value)}
                                placeholder="Nhập URL video"
                            />
                            <Input
                                label="Category ID"
                                type="number"
                                value={formData.category_id?.toString() || ""}
                                onChange={(e) => handleInputChange("category_id", e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="Nhập ID danh mục"
                            />
                            <Input
                                label="Thời gian"
                                value={formData.time || ""}
                                onChange={(e) => handleInputChange("time", e.target.value)}
                                placeholder="Nhập thời gian (e.g., 30m)"
                            />
                            <Input
                                label="Calories"
                                type="number"
                                value={formData.calories?.toString() || ""}
                                onChange={(e) => handleInputChange("calories", e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="Nhập số calories"
                            />
                            <Box>
                                <Text className="text-sm font-medium mb-1">Cấp độ</Text>
                                <select
                                    value={formData.level || ""}
                                    onChange={(e) => handleInputChange("level", e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="" disabled>
                                        Chọn cấp độ
                                    </option>
                                    {levelOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </Box>
                            <Input
                                label="Image URL"
                                value={formData.image_url || ""}
                                onChange={(e) => handleInputChange("image_url", e.target.value || null)}
                                placeholder="Nhập URL hình ảnh"
                            />
                        </Box>
                    </Modal>

                    {/* Modal thêm bài tập */}
                    <Modal
                        visible={isAddModalOpen}
                        title="Thêm bài tập mới"
                        onClose={() => setIsAddModalOpen(false)}
                        actions={[
                            {
                                text: "Hủy",
                                onClick: () => setIsAddModalOpen(false),
                            },
                            {
                                text: "Thêm",
                                onClick: addExercise,
                                highLight: true,
                            },
                        ]}
                    >
                        <Box className="space-y-4">
                            <Input
                                label="Tên bài tập"
                                value={formData.name || ""}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="Nhập tên bài tập"
                            />
                            <Input
                                label="Mô tả"
                                value={formData.description || ""}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="Nhập mô tả"
                            />
                            <Input
                                label="Video URL"
                                value={formData.video_url || ""}
                                onChange={(e) => handleInputChange("video_url", e.target.value)}
                                placeholder="Nhập URL video"
                            />
                            <Input
                                label="Category ID"
                                type="number"
                                value={formData.category_id?.toString() || ""}
                                onChange={(e) => handleInputChange("category_id", e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="Nhập ID danh mục"
                            />
                            <Input
                                label="Thời gian"
                                value={formData.time || ""}
                                onChange={(e) => handleInputChange("time", e.target.value)}
                                placeholder="Nhập thời gian (e.g., 30m)"
                            />
                            <Input
                                label="Calories"
                                type="number"
                                value={formData.calories?.toString() || ""}
                                onChange={(e) => handleInputChange("calories", e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="Nhập số calories"
                            />
                            <Box>
                                <Text className="text-sm font-medium mb-1">Cấp độ</Text>
                                <select
                                    value={formData.level || ""}
                                    onChange={(e) => handleInputChange("level", e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="" disabled>
                                        Chọn cấp độ
                                    </option>
                                    {levelOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </Box>
                            <Input
                                label="Image URL"
                                value={formData.image_url || ""}
                                onChange={(e) => handleInputChange("image_url", e.target.value || null)}
                                placeholder="Nhập URL hình ảnh"
                            />
                        </Box>
                    </Modal>

                    {/* Thanh điều hướng */}
                    {pageNumbers.length > 0 && (
                        <Box className="flex justify-center items-center mt-6 space-x-0.5">
                            <Button
                                onClick={goToPreviousPage}
                                disabled={page === 0}
                                className="py-0.5 px-4 bg-gray-300 text-black rounded-md text-sm disabled:opacity-50"
                            >
                                Previous
                            </Button>

                            {pageNumbers.map((pageNumber) => (
                                <Button
                                    key={pageNumber}
                                    onClick={() => goToPage(pageNumber)}
                                    className={`py-0.5 px-4 rounded-md text-sm ${page === pageNumber
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 text-black"
                                        }`}
                                >
                                    {pageNumber + 1}
                                </Button>
                            ))}

                            <Button
                                onClick={goToNextPage}
                                disabled={!hasMore}
                                className="py-0.5 px-4 bg-gray-300 text-black rounded-md text-sm disabled:opacity-50"
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

export default ExerciseList;
