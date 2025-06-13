import { getToken } from "@/utils/user";
import React, { useState, useEffect } from "react";
import { Box, Text, Button } from "zmp-ui";
import { Modal, Input, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

interface GoalProps {
  userId: number;
}

const SelectGoal: React.FC<GoalProps> = ({ userId }) => {
  const [goals, setGoals] = useState<{ id: number; name: string }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const token = getToken();

  const fetchGoals = async () => {
    try {
      const response = await fetch(`http://localhost:8080/gym/api/v1/goals/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Accept-Language": "vi",
          Origin: "http://localhost:3000",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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

  const handleAddGoal = async () => {
    if (!newGoal.trim()) {
      message.warning("Vui lòng nhập tên mục tiêu");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/gym/api/v1/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          name: newGoal,
        }),
      });

      const result = await response.json();
      if (result.code === 0) {
        message.success("Đã thêm mục tiêu");
        setNewGoal("");
        fetchGoals();
      } else {
        message.error("Thêm mục tiêu thất bại");
      }
    } catch (error) {
      console.error("Error adding goal:", error);
      message.error("Đã có lỗi xảy ra");
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/gym/api/v1/goals/${goalId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.code === 0) {
        message.success("Đã xóa mục tiêu");
        fetchGoals();
      } else {
        message.error("Xóa thất bại");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      message.error("Đã có lỗi xảy ra khi xóa");
    }
  };

  useEffect(() => {
    if (userId > 0) {
      fetchGoals();
    }
  }, [userId]);

  return (
    <Box className="my-6 px-6">
      {/* Tiêu đề + nút See All ngang hàng */}
      <Box className="flex justify-between items-center mb-4">
        <Text className="font-bold text-xl">My goal</Text>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-white  text-black rounded-lg px-4 py-2"
        >
          See All
        </Button>
      </Box>

      {/* Danh sách goal hiển thị ngang */}
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

      {/* Modal hiển thị danh sách đầy đủ + thêm goal */}
      <Modal
        title="Tất cả mục tiêu của bạn"
        open={showModal}
        onCancel={() => setShowModal(false)}
        onOk={handleAddGoal}
        okText="Thêm mục tiêu"
        cancelText="Đóng"
      >
        <Box className="mb-4 max-h-60 overflow-y-auto space-y-2">
          {goals.length > 0 ? (
            goals.map((goal) => (
              <Box
                key={goal.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px",
                  border: "1px solid #d9d9d9",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  backgroundColor: "#fff",
                }}
                onMouseEnter={(e) => {
                  const icon = e.currentTarget.querySelector(".delete-icon") as HTMLElement;
                  if (icon) icon.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  const icon = e.currentTarget.querySelector(".delete-icon") as HTMLElement;
                  if (icon) icon.style.opacity = "0";
                }}
              >
                <Text>{goal.name}</Text>
                <DeleteOutlined
                  className="delete-icon"
                  onClick={() => handleDeleteGoal(goal.id)}
                  style={{
                    color: "red",
                    cursor: "pointer",
                    opacity: 0,
                    transition: "opacity 0.3s",
                  }}
                />
              </Box>
            ))
          ) : (
            <Text>Không có mục tiêu nào</Text>
          )}
        </Box>

        <Input
          placeholder="Nhập mục tiêu mới"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
        />
      </Modal>
    </Box>
  );
};

export default SelectGoal;
