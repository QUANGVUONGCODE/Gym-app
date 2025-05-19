import React, { useState, useEffect } from "react";
import { Box, Text, Button, Avatar, Input } from "zmp-ui";
import { useAppNavigation } from "@/utils/navigation";
import Footer from "./footer/footer";
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getToken } from "@/utils/user";

const CategoryList2 = () => {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState<string>("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true); // Thêm state để kiểm tra còn dữ liệu không
  const { goToExerciseByCategoryId, goback } = useAppNavigation();


  const fetchCategories = async (searchKeyword: string, currentPage: number, isLoadMore: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }
      const response = await fetch(`http://localhost:8080/gym/api/v1/categories/search?page=${currentPage}&limit=6&keyword=${searchKeyword}`, {
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
      console.log("Categories API Response Data:", data);

      if (data.code === 0 && data.result && Array.isArray(data.result.categories)) {
        const newCategories = data.result.categories.map((category: { id: number; name: string }) => ({
          id: category.id,
          name: category.name,
        }));

        // Nếu là load more, nối dữ liệu mới vào danh sách hiện tại; nếu không, thay thế
        setCategories((prevCategories) =>
          isLoadMore ? [...prevCategories, ...newCategories] : newCategories
        );

        // Kiểm tra còn dữ liệu để tải không (nếu trả về < 6 danh mục, có thể hết)
        setHasMore(newCategories.length === 6);
      } else {
        setCategories([]); // Nếu không có dữ liệu hợp lệ
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Error fetching categories");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API lần đầu khi component mount
  useEffect(() => {
    fetchCategories("", 0); // Tải trang đầu tiên khi component mount
  }, []); // Chỉ gọi một lần khi mount, không phụ thuộc page hay keyword

  // Xử lý tìm kiếm
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKeyword = e.target.value;
    setKeyword(newKeyword); // Cập nhật từ khóa tìm kiếm
    setPage(0); // Reset trang về 0
    setCategories([]); // Xóa danh sách hiện tại
    setHasMore(true); // Reset hasMore
    fetchCategories(newKeyword, 0); // Gọi API với từ khóa mới
  };

  const handleSearch = () => {
    fetchCategories(keyword, 0); // Tìm kiếm từ đầu trang với từ khóa hiện tại
  };

  const loadMoreCategories = () => {
    const nextPage = page + 1; // Tăng trang
    setPage(nextPage);
    fetchCategories(keyword, nextPage, true); // Tải thêm dữ liệu cho trang tiếp theo
  };

  const handleCategoryClick = (categoryId: number) => {
    // Navigate to the exercise screen with the selected category's ID
    goToExerciseByCategoryId(categoryId);  // Assuming goToCategories handles the navigation
    console.log("Navigating to category detail for ID:", categoryId);
  };



  return (
    <Box className="my-6 px-6 mb-2">
      <Box className="justify-center items-center mt-16">
        {/* Đặt các phần tử trong cùng một container */}
        <Box className="flex justify-between items-center px-4">
          {/* Nút quay lại */}
          <div
            onClick={goback}
            className="flex items-center justify-center bg-white rounded-full w-10 h-10 shadow-md cursor-pointer"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-[24px] text-black" />
          </div>

          {/* Tiêu đề Categories */}
          <Text className="text-[24px] font-bold mr-24">Categories</Text>
        </Box>
      </Box>

      {/* Tìm kiếm */}
      <Box className="px-6 mt-4">
        <Input.Search
          placeholder="Search"
          className="w-full"
          value={keyword}
          onChange={handleSearchChange} // Cập nhật từ khóa khi thay đổi
          onSearch={handleSearch} // Gọi hàm tìm kiếm khi nhấn Enter hoặc nhấn nút tìm kiếm
        />
      </Box>

      {/* Categories */}
      <Box className="grid grid-cols-2 gap-6 mt-6 pb-2">
        {loading && categories.length === 0 ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text className="text-red-500">{error}</Text>
        ) : categories.length > 0 ? (
          categories.map((category, index) => (
            <Box key={`${category.id}-${index}`} flex flexDirection="column" alignItems="center"
              onClick={() => handleCategoryClick(category.id)}
            >
              <Avatar
                className="mb-2"
                size={120}
                src="src/assets/yoga.png" // Hình ảnh mặc định
              />
              <Text className="font-semibold text-[20px]">{category.name}</Text>
            </Box>
          ))
        ) : (
          <Text>No categories available</Text>
        )}
      </Box>

      {/* Footer */}
      <Footer />

      {/* Load More Button */}
      {hasMore && !loading && categories.length > 0 && (
        <Box className="mt-4 text-center">
          <Button onClick={loadMoreCategories} className="bg-green-500 text-white mb-20">
            See more
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CategoryList2;