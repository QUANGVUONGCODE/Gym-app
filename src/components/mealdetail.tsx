import React, { useState, useEffect } from "react";
import { Box, Text, Button, useParams } from "zmp-ui";
import { Modal, message, Select } from "antd"; // Thêm Select từ antd
import Footer from "./footer/footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFire } from "@fortawesome/free-solid-svg-icons";
import { useAppNavigation } from "@/utils/navigation";
import moment from "moment";
import { getToken, getUserId } from "@/utils/user";

interface Meal {
  id: number;
  name: string;
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
  description?: string;
  image?: string;
}

const MealPlanDetail1 = () => {
  const { id } = useParams<{ id: string }>();
  const [mealDetail, setMealDetail] = useState<Meal | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(moment().format("YYYY-MM-DD")); // Ngày hôm na
  const [selectedTime, setSelectedTime] = useState<string>("19:00");
  const [selectedMealType, setSelectedMealType] = useState<string>("Lunner"); // State mới cho meal_type
  const [reminderOn, setReminderOn] = useState<boolean>(false);
  const { goback } = useAppNavigation();
  const userId = getUserId() ?? 0;
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }

  // Danh sách các meal_type
  const mealTypes = [
    { label: "Breakfast", value: "Breakfast" },
    { label: "Lunch", value: "Lunch" },
    { label: "Dinner", value: "Dinner" },
    { label: "Lunner", value: "Lunner" },
    { label: "Snack", value: "Snack" },
  ];

  const fetchMealDetail = async (mealId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8080/gym/api/v1/meals/${mealId}`, {
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
      console.log("Meal Detail API Response Data:", data);
      if (data.code === 0 && data.result) {
        setMealDetail(data.result);
      } else {
        setError("No meal data found");
      }
    } catch (error) {
      setError("Error fetching meal detail");
      console.error("Error fetching meal detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedMeals = async () => {
    try {

      const response = await fetch(`http://localhost:8080/gym/api/v1/meals?keyword=&page=0&limit=10`, {
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
      console.log("Related Meals API Response Data:", data);
      if (data.code === 0 && data.result && Array.isArray(data.result.meals)) {
        setMeals(data.result.meals);
      }
    } catch (error) {
      console.error("Error fetching related meals:", error);
    }
  };

  const createNutritionPlan = async () => {
    const payload = {
      user_id: userId,
      meal_type: selectedMealType.toLowerCase(), // Sử dụng meal_type được chọn
      meal_id: parseInt(id || "0"),
      meal_time: selectedTime,
      created_at: selectedDate,
    };

    try {
      const response = await fetch("http://localhost:8080/gym/api/v1/nutrition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Nutrition API Response Data:", data);
      if (data.code === 0) {
        message.success("Nutrition plan created successfully!", 2);
        setShowReminderModal(false);
      } else {
        throw new Error("Failed to create nutrition plan");
      }
    } catch (error) {
      console.error("Error creating nutrition plan:", error);
      message.error("Error creating nutrition plan", 2);
    }
  };

  useEffect(() => {
    if (id && !isNaN(parseInt(id))) {
      fetchMealDetail(id);
      fetchRelatedMeals();
    } else {
      setError("Invalid or missing ID in URL");
    }
  }, [id]);

  // Logic để tạo lịch
  const daysInMonth = moment(selectedDate).daysInMonth();
  const firstDayOfMonth = moment(selectedDate).startOf("month").day();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const currentDate = moment();

  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => (
    <Box key={`padding-${i}`} className="text-center py-2" />
  ));

  return (
    <>
      {loading ? (
        <Box className="flex justify-center items-center h-screen">
          <Text>Loading...</Text>
        </Box>
      ) : error ? (
        <Box className="flex justify-center items-center h-screen">
          <Text className="text-red-500">{error}</Text>
        </Box>
      ) : mealDetail ? (
        <>
          {/* Modal nhắc nhở */}
          <Modal
            open={showReminderModal}
            onCancel={() => setShowReminderModal(false)}
            footer={null}
            centered
            bodyStyle={{ padding: 24 }}
          >
            <Box className="space-y-6">
              {/* Meal Type Picker */}
              <Box>
                <Text className="text-sm font-semibold text-gray-600 mb-2">Meal Type</Text>
                <Select
                  value={selectedMealType}
                  onChange={(value) => setSelectedMealType(value)}
                  options={mealTypes}
                  className="w-full"
                />
              </Box>

              {/* Date Picker */}
              <Box>
                <Text className="text-sm font-semibold text-gray-600 mb-2">Date</Text>
                <Box className="flex justify-between items-center">
                  <Button
                    size="small"
                    onClick={() => {
                      const newDate = moment(selectedDate).subtract(1, "month").format("YYYY-MM-DD");
                      setSelectedDate(newDate);
                    }}
                  >
                    {"<"}
                  </Button>
                  <Text>{moment(selectedDate).format("MMMM YYYY")}</Text>
                  <Button
                    size="small"
                    onClick={() => {
                      const newDate = moment(selectedDate).add(1, "month").format("YYYY-MM-DD");
                      setSelectedDate(newDate);
                    }}
                  >
                    {">"}
                  </Button>
                </Box>
                <Box className="grid grid-cols-7 gap-2 mt-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                    <Text key={index} className="text-center text-sm text-gray-600">
                      {day}
                    </Text>
                  ))}
                  {paddingDays}
                  {daysArray.map((day) => {
                    const currentDateInMonth = moment(selectedDate).date(day);
                    const isPastDate = currentDateInMonth.isBefore(currentDate, "day");
                    const isSelected = selectedDate === currentDateInMonth.format("YYYY-MM-DD");

                    return (
                      <Box
                        key={day}
                        className={`text-center py-2 rounded-full cursor-pointer ${isSelected ? "bg-black text-white" : isPastDate ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-100"
                          }`}
                        onClick={() => {
                          if (!isPastDate) {
                            setSelectedDate(currentDateInMonth.format("YYYY-MM-DD"));
                          }
                        }}
                      >
                        <Text>{day}</Text>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* Time Picker */}
              <Box>
                <Text className="text-sm font-semibold text-gray-600 mb-2">Time</Text>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </Box>

              {/* Set Reminder */}
              <Box className="flex justify-between items-center">
                <Box className="flex items-center gap-2">
                  <i className="fa fa-bell text-gray-600"></i>
                  <Text className="text-sm font-semibold text-gray-600">Set Reminder</Text>
                </Box>
                <Button
                  size="small"
                  onClick={() => setReminderOn(!reminderOn)}
                  className={`w-12 h-6 rounded-full flex items-center p-1 ${reminderOn ? "bg-green-500" : "bg-gray-300"
                    }`}
                >
                  <Box
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${reminderOn ? "translate-x-6" : ""
                      }`}
                  />
                </Button>
              </Box>

              {/* Nút CREATE */}
              <Button
                className="w-full py-3 bg-green-500 text-white text-lg rounded-md mt-6"
                onClick={createNutritionPlan}
              >
                CREATE
              </Button>
            </Box>
          </Modal>

          <Box
            className="h-[380px]"
            style={{
              backgroundImage: `url(${mealDetail.image || "https://i.pinimg.com/736x/11/e9/22/11e9223f98b0bec9e851097a5a224b19.jpg"})`,
              backgroundSize: "cover",
            }}
          >
            <Box className="justify-center items-center pointer">
              <Box className="flex justify-between items-center px-4 pt-5">
                <div
                  onClick={goback}
                  className="flex items-center justify-center bg-white rounded-full w-10 h-10 shadow-md mt-5"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="text-[24px] text-black" />
                </div>
              </Box>
            </Box>
          </Box>
          <Box className="px-6 space-y-6 mb-9 bg-white">
            {/* Thông tin món ăn chính */}
            <Box className="bg-white rounded-lg shadow-md p-4 relative top-[-50px]">
              <Box className="flex items-center justify-center gap-2 mb-4">
                <FontAwesomeIcon icon={faFire} className="text-red-500 text-lg" />
                <Text className="font-bold text-xl">
                  {mealDetail.calories ? `${mealDetail.calories} kcal` : "Calories: N/A"}
                </Text>
              </Box>
              <Box className="grid grid-cols-3 gap-6 mt-4">
                <Box flex flexDirection="column" alignContent="center" className="gap-2">
                  <Text className="text-sm text-gray-600">Fat</Text>
                  <Text className="font-bold">{mealDetail.fat ? `${mealDetail.fat}g` : "N/A"}</Text>
                </Box>
                <Box flex flexDirection="column" alignContent="center" className="gap-2">
                  <Text className="text-sm text-gray-600">Protein</Text>
                  <Text className="font-bold">{mealDetail.protein ? `${mealDetail.protein}g` : "N/A"}</Text>
                </Box>
                <Box flex flexDirection="column" alignContent="center" className="gap-2">
                  <Text className="text-sm text-gray-600">Carbs</Text>
                  <Text className="font-bold">{mealDetail.carbs ? `${mealDetail.carbs}g` : "N/A"}</Text>
                </Box>
              </Box>
              <Text className="text-xl font-semibold mt-4">{mealDetail.name || "Untitled Meal"}</Text>
              <Text className="text-sm text-gray-600 mt-2">
                {mealDetail.description || "No description available."}
              </Text>
              <Box className="mt-6">
                <Button
                  className="w-full py-3 bg-green-500 text-white text-lg rounded-md"
                  onClick={() => {
                    message.success("Meal registered successfully!", 2);
                    setShowReminderModal(true);
                  }}
                >
                  ADD MEAL
                </Button>
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        <Box className="flex justify-center items-center h-screen">
          <Text>No meal details available</Text>
        </Box>
      )}

      <Footer />
    </>
  );
};

export default MealPlanDetail1;