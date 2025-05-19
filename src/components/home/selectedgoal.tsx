import { getToken } from "@/utils/user";
import React, { useState, useEffect } from "react";
import { Box, Text, Button } from "zmp-ui";

interface GoalProps {
  userId: number;
}

const SelectGoal: React.FC<GoalProps> = ({ userId }) => {
  const [goals, setGoals] = useState<{ id: number; name: string }[]>([]);
  const token = getToken();
  const fetchGoals = async () => {
    try {
      const response = await fetch(`http://localhost:8080/gym/api/v1/goals/user/${userId}`, {
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
        setGoals(data.result.map((goal: { id: number; name: string }) => ({
          id: goal.id,
          name: goal.name,
        })));
      } else {
        setGoals([]);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      setGoals([]);
    }
  };


  useEffect(() => {
    if (userId > 0) {
      fetchGoals();
    }
  }, [userId]);

  return (
    <Box className="my-6 px-6">
      <Text className="font-bold text-xl mb-4">Select your goal</Text>
      <Box className="flex overflow-x-auto space-x-4 pb-2 snap-x snap-mandatory">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <Button
              key={goal.id}
              className="flex-none w-40 bg-green-500 text-white rounded-lg p-4 snap-center"
            >
              {goal.name}
            </Button>
          ))
        ) : (
          <Text>No goals available</Text>
        )}
      </Box>
    </Box>
  );
};

export default SelectGoal;