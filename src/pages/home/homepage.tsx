import React, { useState, useEffect } from 'react';
import { Box, Text, Input, Button, Avatar } from 'zmp-ui';
import { Drawer } from 'antd';
import SelectGoal from '@/components/home/selectedgoal';
import CategoryList from '@/components/home/selectedcategory';
import SelectExercise from '@/components/home/selectedExercise';
import SelectExercise2 from '@/components/home/selectedExercise2';
import SelectMeal from '@/components/home/selectedMeal';
import SelectUser from '@/components/home/user';
import Footer from '@/components/footer/footer';
import { useAppNavigation } from '@/utils/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRunning, faList, faUser, faHeart, faSignOutAlt, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import { getToken, getUserId, logout } from '@/utils/user';

const HomePage: React.FC = () => {
  const userId = getUserId() ?? 0;
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { goToTranning, goToCategories, goToProfile, goToFavorite, goToDashboard, goToLoggin } = useAppNavigation();

  // Lấy thông tin user từ API
  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }
      const response = await fetch(`http://localhost:8080/gym/api/v1/users/${userId}`, {
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
      console.log("User API Response Data:", data);
      if (data.code === 0 && data.result) {
        setUser(data.result);
      } else {
        throw new Error("No user data available");
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      setError(error.message || "Error fetching user data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout(); // Gọi hàm logout
    goToLoggin();
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return <Box className="p-4"><Text>Loading...</Text></Box>;
  }

  if (error) {
    return <Box className="p-4"><Text className="text-red-500">{error}</Text></Box>;
  }

  return (
    <>
      {/* Drawer (Menu điều hướng) */}
      <Drawer
        open={drawerVisible} // Thay visible bằng open (API của antd)
        onClose={() => setDrawerVisible(false)}
        placement="left"
        width={300}
        bodyStyle={{ padding: 0 }} // Tùy chỉnh style của Drawer
      >
        {/* Header của Drawer */}
        <Box className="p-4 bg-white">
          <Box className="flex items-center">
            <Avatar
              src={user ? `http://localhost:8080/gym/api/v1/images/${user.description}`
              : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"}

              size={60}
            />
            <Box className="ml-4">
              <Text className="text-lg font-bold">{user?.name ? `${user.name} !` : "User !"}</Text>
              <Text className="text-sm text-gray-600">{user?.role?.name || "Basic member"}</Text>
            </Box>
          </Box>

        </Box>

        {/* Danh sách các mục điều hướng */}
        <Box className="p-4">
          {/* Training */}
          <Box
            className="flex items-center py-3 cursor-pointer"
            onClick={goToTranning} // Sử dụng hàm từ useAppNavigation
          >
            <FontAwesomeIcon icon={faRunning} className="text-gray-600 mr-4 text-xl" />
            <Text className="text-base">Training</Text>
          </Box>

          {/* Categories */}
          <Box
            className="flex items-center py-3 cursor-pointer"
            onClick={goToCategories}
          >
            <FontAwesomeIcon icon={faList} className="text-gray-600 mr-4 text-xl" />
            <Text className="text-base">Categories</Text>
          </Box>

          <Box
            className="flex items-center py-3 cursor-pointer"
            onClick={goToDashboard}
          >
            <FontAwesomeIcon icon={faTachometerAlt} className="text-gray-600 mr-4 text-xl" />
            <Text className="text-base">Dashboard</Text>
          </Box>

          {/* My Account */}
          <Box
            className="flex items-center py-3 cursor-pointer"
            onClick={goToProfile}
          >
            <FontAwesomeIcon icon={faUser} className="text-gray-600 mr-4 text-xl" />
            <Text className="text-base">My Account</Text>
          </Box>

          {/* My Favorites */}
          <Box
            className="flex items-center py-3 cursor-pointer"
            onClick={goToFavorite}
          >
            <FontAwesomeIcon icon={faHeart} className="text-gray-600 mr-4 text-xl" />
            <Text className="text-base">My Favorites</Text>
          </Box>
        </Box>

        {/* Sign Out */}
        <Box className="p-4">
          <Box
            className="flex items-center py-3 cursor-pointer"
            onClick={() => {
              handleLogout();
              setDrawerVisible(false);
            }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="text-gray-600 mr-4 text-xl" />
            <Text className="text-base">Sign Out</Text>
          </Box>
        </Box>
      </Drawer>

      {/* Header */}
      <SelectUser setDrawerVisible={setDrawerVisible} />

      <SelectGoal userId={userId} />
      {/* Category */}
      <CategoryList />
      <hr className="border border-gray-300 border-solid mx-6" />
      {/* Popular Exercise */}
      <SelectExercise />
      {/* Meal plans */}
      <SelectMeal />
      {/* Addtional exercises */}
      <SelectExercise2 />
      {/* Footer */}
      <Footer />
    </>
  );
};

export default HomePage;