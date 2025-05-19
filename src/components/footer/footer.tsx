import React, { useState } from 'react';
import { Box, Text } from 'zmp-ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUtensils, faDumbbell, faUser } from '@fortawesome/free-solid-svg-icons';
import { useAppNavigation } from '@/utils/navigation';

const Footer = () => {
  const { goToIndex, goToProfile, goToExercise, goToMealPlan } = useAppNavigation();
  const [activePage, setActivePage] = useState('home'); // Default active page

  // Handle navigation and set active page
  const handleNavigation = (page) => {
    setActivePage(page); // Set the active page
    if (page === 'index') goToIndex();
    else if (page === 'profile') goToProfile();
    else if( page === 'exercise') goToExercise();
    else if( page === 'mealplan') goToMealPlan();
    console.log(`Navigating to ${page}`);
    // Add other navigation logic if needed
  };

  return (
    <Box className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 flex justify-between items-center border-t px-6 rounded-t-[30px]">
      {/* Home */}
      <Box
        className={`flex flex-col items-center justify-center ${activePage === 'home' ? 'text-green-400' : 'text-gray-400'} pointer`}
        onClick={() => handleNavigation('index')}
      >
        <FontAwesomeIcon icon={faHome} size="lg" />
        <Text className="text-sm">Home</Text>
      </Box>

      {/* Meal Plans */}
      <Box
        className={`flex flex-col items-center justify-center ${activePage === 'mealplan' ? 'text-green-400' : 'text-gray-400'}`}
        onClick={() => handleNavigation('mealplan')}
      >
        <FontAwesomeIcon icon={faUtensils} size="lg" />
        <Text className="text-sm">Meal Plans</Text>
      </Box>

      {/* Exercise */}
      <Box
        className={`flex flex-col items-center justify-center ${activePage === 'exercise' ? 'text-green-400' : 'text-gray-400'}`}
        onClick={() => handleNavigation('exercise')}
      >
        <FontAwesomeIcon icon={faDumbbell} size="lg" />
        <Text className="text-sm">Exercise</Text>
      </Box>

      {/* Profile */}
      <Box
        className={`flex flex-col items-center justify-center ${activePage === 'profile' ? 'text-green-400' : 'text-gray-400'} pointer`}
        onClick={() => handleNavigation('profile')}
      >
        <FontAwesomeIcon icon={faUser} size="lg" />
        <Text className="text-sm">Profile</Text>
      </Box>
    </Box>
  );
};

export default Footer;
