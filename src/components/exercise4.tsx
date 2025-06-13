import React, { useState, useEffect } from "react";
import { Box, Button, Text } from "zmp-ui";
import Footer from "./footer/footer";
import { useAppNavigation } from "@/utils/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { getToken } from "@/utils/user";

function Exercise4() {
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [exercises, setExercises] = useState<{ id: number; name: string; video_url: string; time: string; calories: string; level: string; image_url: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [keyword, setKeyword] = useState<string>(""); // Từ khóa tìm kiếm
    const [categoryId, setCategoryId] = useState<string | null>(null); // Danh mục hiện tại
    const [page, setPage] = useState(0); // Trạng thái trang hiện tại
    const [hasMore, setHasMore] = useState(true); // Kiểm tra xem còn bài tập để tải hay không
    const { goToExerciseDetail, goback } = useAppNavigation();
    const token = getToken();

    // Hàm gọi API để lấy danh mục
    const fetchCategories = async () => {
        try {
            if (!token) {
                throw new Error("No authentication token found. Please log in.");
            }
            const response = await fetch("http://localhost:8080/gym/api/v1/categories/search?page=0&limit=5&keyword=", {
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
                setCategories(
                    data.result.categories.map((category: { id: number; name: string }) => ({
                        id: category.id,
                        name: category.name,
                    }))
                );
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            setCategories([]);
        }
    };

    // Hàm gọi API để lấy bài tập theo từ khóa và danh mục
    const fetchExercises = async () => {
        if (loading) return; // Nếu đang loading thì không gọi API nữa

        setLoading(true);
        setError(null);
        try {
            if (!token) {
                throw new Error("No authentication token found. Please log in.");
            }

            let url = `http://localhost:8080/gym/api/v1/exercises?keyword=${keyword}&page=${page}&limit=5`; // Limit 5 bài tập mỗi lần

            if (categoryId) {
                url = `http://localhost:8080/gym/api/v1/exercises?keyword=${keyword}&category_id=${categoryId}&page=${page}&limit=5`;
            }

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
                // Nếu có bài tập mới, thêm vào danh sách
                setExercises(prevExercises => [
                    ...prevExercises,
                    ...data.result.exercises.map((exercise: { id: number; name: string; video_url: string; time: string; calories: string; level: string, image_url: string }) => ({
                        id: exercise.id,
                        name: exercise.name,
                        video_url: exercise.video_url,
                        time: exercise.time,
                        calories: exercise.calories,
                        level: exercise.level,
                        image_url: exercise.image_url
                    })),
                ]);

                // Kiểm tra xem còn bài tập để tải hay không
                setHasMore(data.result.exercises.length === 5);
            } else {
                setHasMore(false); // Nếu không có bài tập, ẩn nút "See More"
            }
        } catch (error) {
            console.error("Error fetching exercises:", error);
            setExercises([]);
            // setError();
        } finally {
            setLoading(false);
        }
    };


    // Hàm thay đổi từ khóa tìm kiếm
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newKeyword = e.target.value;
        setKeyword(newKeyword);
        setPage(0); // Reset trang về 0 khi thay đổi từ khóa
        setExercises([]); // Xóa danh sách bài tập hiện tại khi thay đổi từ khóa
    };

    // Hàm tìm kiếm bài tập
    const handleSearch = () => {
        fetchExercises(); // Gọi API khi nhấn tìm kiếm
    };

    // Hàm tải thêm bài tập khi nhấn "See More"
    const loadMoreExercises = () => {
        const nextPage = page + 1;
        setPage(nextPage); // Tăng trang
        fetchExercises(); // Tải thêm bài tập
    };

    // Hàm khi nhấn vào danh mục
    const handleCategoryClick = (id: string) => {
        setCategoryId(id); // Cập nhật category_id
        setPage(0); // Reset trang về 0 khi thay đổi danh mục
        setExercises([]); // Xóa danh sách bài tập hiện tại khi thay đổi danh mục
    };

    const handleExerciseClick = (exerciseId: number) => {
        goToExerciseDetail(exerciseId);  // Điều hướng đến chi tiết bài tập với id
    };

    // useEffect để gọi API khi từ khóa hoặc trang thay đổi
    useEffect(() => {
        fetchExercises(); // Gọi API khi trang hoặc từ khóa thay đổi
    }, [page, keyword, categoryId]); // Khi page, keyword hoặc categoryId thay đổi

    useEffect(() => {
        fetchCategories(); // Gọi API lấy danh mục khi component mount
    }, []);

    return (
        <>
            <Box className="justify-center items-center mt-16">
                <Box className="flex justify-between items-center px-4">
                    <div onClick={goback} className="flex items-center justify-center bg-white rounded-full w-10 h-10 shadow-md cursor-pointer">
                        <FontAwesomeIcon icon={faArrowLeft} className="text-[24px] text-black" />
                    </div>
                    <Text className="text-[24px] font-bold mr-36">Exercises</Text>
                </Box>
            </Box>

            {/* Category buttons */}
            <Box className="px-6 mt-6">
                <Box className="flex overflow-x-auto space-x-4 pb-2 snap-x snap-mandatory">
                    {categories.length > 0 ? (
                        categories.map((category) => (
                            <Box key={category.id} flex flexDirection="column" alignItems="center">
                                <button
                                    className="px-6 py-2 rounded-lg bg-gray-300 text-gray-600 font-semibold text-[14px] transition-all duration-200 ease-in-out hover:bg-black hover:text-white"
                                    onClick={() => handleCategoryClick(category.id.toString())} // Gọi hàm khi nhấn vào danh mục
                                >
                                    <Text className="pointer">{category.name}</Text>
                                </button>
                            </Box>
                        ))
                    ) : (
                        <Text>No categories available</Text>
                    )}
                </Box>
            </Box>

            {/* Search box */}
            <Box className="px-6 mt-6">
                <input
                    type="text"
                    placeholder="Search for exercises..."
                    value={keyword}
                    onChange={handleSearchChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <Button
                    onClick={handleSearch}
                    className="mt-2 bg-blue-500 text-white p-2 rounded-lg w-full"
                >
                    Search
                </Button>
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
                            key={`${exercise.id}-${index}`} // Ensuring uniqueness by combining id and index
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

            {hasMore && !loading && (
                <Box className="text-center mb-20">
                    <Button onClick={loadMoreExercises} className="bg-green-500 text-white mb-10">
                        See More
                    </Button>
                </Box>
            )}

            <Footer />
        </>
    );
}

export default Exercise4;
