import React, { useState, useEffect } from "react";
import { Box, Button, Text, Modal, Input } from "zmp-ui";
import { getToken } from "@/utils/user";

interface Category {
    id: number;
    name: string;
    image_url: string | null;
}

const CategoryList = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [limit] = useState<number>(10);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<Partial<Category>>({});

    // Hàm gọi API để lấy tổng số danh mục
    const fetchTotalCategories = async () => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error("No authentication token found. Please log in.");
            }

            const response = await fetch("http://localhost:8080/gym/api/v1/categories/count", {
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
            console.log("Total Categories API Response:", data);

            if (data.code === 0 && data.result !== undefined) {
                setTotalItems(data.result);
            } else {
                console.error("No total categories data found");
            }
        } catch (error) {
            console.error("Error fetching total categories:", error);
        }
    };

    // Hàm gọi API để lấy danh sách danh mục
    const fetchCategories = async (pageNumber: number) => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            if (!token) {
                throw new Error("No authentication token found. Please log in.");
            }

            const response = await fetch(
                `http://localhost:8080/gym/api/v1/categories/search?page=${pageNumber}&limit=${limit}&keyword=`,
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
            console.log("Category API Response Data:", data);

            if (data.code === 0 && data.result && Array.isArray(data.result.categories)) {
                const newCategories = data.result.categories;
                setCategories(newCategories);
                setHasMore(newCategories.length === limit && (pageNumber + 1) * limit < totalItems);
            } else {
                setError("No categories data found");
                setCategories([]);
                setHasMore(false);
            }
        } catch (error) {
            setError("Error fetching categories");
            console.error("Error fetching categories:", error);
            setCategories([]);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    // Hàm gọi API để thêm danh mục mới
    const addCategory = async () => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error("No authentication token found. Please log in.");
            }

            const response = await fetch("http://localhost:8080/gym/api/v1/categories", {
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
            console.log("Add Category API Response:", data);

            if (data.code === 0) {
                setIsAddModalOpen(false);
                setFormData({});
                fetchCategories(page);
                fetchTotalCategories();
            } else {
                setError("Failed to add category");
            }
        } catch (error) {
            setError("Error adding category");
            console.error("Error adding category:", error);
        }
    };

    // Hàm gọi API để sửa danh mục
    const updateCategory = async () => {
        if (!selectedCategory) return;

        try {
            const token = getToken();
            if (!token) {
                throw new Error("No authentication token found. Please log in.");
            }

            const response = await fetch(
                `http://localhost:8080/gym/api/v1/categories/${selectedCategory.id}`,
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
            console.log("Update Category API Response:", data);

            if (data.code === 0) {
                setIsEditModalOpen(false);
                fetchCategories(page);
                fetchTotalCategories();
            } else {
                setError("Failed to update category");
            }
        } catch (error) {
            setError("Error updating category");
            console.error("Error updating category:", error);
        }
    };

    // Hàm gọi API để xóa danh mục
    const deleteCategory = async (id: number) => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error("No authentication token found. Please log in.");
            }

            const response = await fetch(`http://localhost:8080/gym/api/v1/categories/${id}`, {
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
            console.log("Delete Category API Response:", data);

            if (data.code === 0) {
                fetchCategories(page);
                fetchTotalCategories();
            } else {
                setError("Failed to delete category");
            }
        } catch (error) {
            setError("Error deleting category");
            console.error("Error deleting category:", error);
        }
    };

    // Hàm mở modal chỉnh sửa và điền dữ liệu form
    const openEditModal = (category: Category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            image_url: category.image_url,
        });
        setIsEditModalOpen(true);
    };

    // Hàm mở modal thêm danh mục
    const openAddModal = () => {
        setFormData({
            name: "",
            image_url: "",
        });
        setIsAddModalOpen(true);
    };

    // Hàm xử lý thay đổi input trong form
    const handleInputChange = (field: keyof Category, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        fetchTotalCategories();
        fetchCategories(page);
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
                <Text className="font-bold text-xl">Category List</Text>
                <Button
                    onClick={openAddModal}
                    className="py-2 px-4 bg-green-500 text-white rounded-md text-sm"
                >
                    Thêm danh mục
                </Button>
            </Box>

            {error && <Text className="text-red-500">{error}</Text>}

            {loading && categories.length === 0 ? (
                <Box className="flex justify-center items-center">
                    <Text>Loading...</Text>
                </Box>
            ) : (
                <>
                    {categories.length > 0 ? (
                        <Box className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="py-2 px-4 border-b text-left">ID</th>
                                        <th className="py-2 px-4 border-b text-left">Name</th>
                                        <th className="py-2 px-4 border-b text-left">Image URL</th>
                                        <th className="py-2 px-4 border-b text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((category) => (
                                        <tr
                                            key={category.id}
                                            className={`hover:bg-gray-100 ${selectedCategory?.id === category.id ? "bg-blue-100" : ""}`}
                                        >
                                            <td className="py-2 px-4 border-b">{category.id}</td>
                                            <td className="py-2 px-4 border-b">{category.name}</td>
                                            <td className="py-2 px-4 border-b">
                                                {category.image_url ? (
                                                    <a
                                                        href={category.image_url}
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
                                                    onClick={() => openEditModal(category)}
                                                    className="py-1 px-2 bg-blue-500 text-white rounded-md text-xs"
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    onClick={() => deleteCategory(category.id)}
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
                        <Text className="text-sm text-gray-600">No categories available</Text>
                    )}

                    {/* Modal chỉnh sửa danh mục */}
                    <Modal
                        visible={isEditModalOpen}
                        title="Chỉnh sửa danh mục"
                        onClose={() => setIsEditModalOpen(false)}
                        actions={[
                            {
                                text: "Hủy",
                                onClick: () => setIsEditModalOpen(false),
                            },
                            {
                                text: "Lưu",
                                onClick: updateCategory,
                                highLight: true,
                            },
                        ]}
                    >
                        <Box className="space-y-4">
                            <Input
                                label="Tên danh mục"
                                value={formData.name || ""}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="Nhập tên danh mục"
                            />
                            <Input
                                label="Image URL"
                                value={formData.image_url || ""}
                                onChange={(e) => handleInputChange("image_url", e.target.value || null)}
                                placeholder="Nhập URL hình ảnh"
                            />
                        </Box>
                    </Modal>

                    {/* Modal thêm danh mục */}
                    <Modal
                        visible={isAddModalOpen}
                        title="Thêm danh mục mới"
                        onClose={() => setIsAddModalOpen(false)}
                        actions={[
                            {
                                text: "Hủy",
                                onClick: () => setIsAddModalOpen(false),
                            },
                            {
                                text: "Thêm",
                                onClick: addCategory,
                                highLight: true,
                            },
                        ]}
                    >
                        <Box className="space-y-4">
                            <Input
                                label="Tên danh mục"
                                value={formData.name || ""}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="Nhập tên danh mục"
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
                                    className={`py-0.5 px-2 rounded-md text-xs ${page === pageNumber
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

export default CategoryList;