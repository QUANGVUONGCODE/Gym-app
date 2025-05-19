import { getToken, getUserId } from "@/utils/user";
import React, { useState, useEffect } from "react";
import { Box, Text, Button, Avatar, Input } from "zmp-ui";

interface SelectUserProps {
    setDrawerVisible: (visible: boolean) => void; // Prop để mở Drawer
}

const SelectUser: React.FC<SelectUserProps> = ({ setDrawerVisible }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const userId = getUserId() ?? 0;
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
                setError("No user data available");
            }
        } catch (error) {
            setError("Error fetching user data: ");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const currentHour = new Date().getHours();
        if (currentHour < 12) {
            return "Good Morning";
        } else if (currentHour >= 12 && currentHour < 18) {
            return "Good Afternoon";
        } else {
            return "Good Evening";
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <Box className="sticky flex flex-col justify-between items-start p-6 bg-green-500 text-white pt-7 rounded-b-[30px]">
            <Box className="flex justify-between items-center w-full mb-4 mt-5">
                {/* Các phần tử trong Header */}
            </Box>
            <Box className="flex flex-col items-start mb-4">
                <Text.Title size="large" className="font-bold mb-2">
                    {getGreeting()}
                </Text.Title>
                <Box flex flexDirection="row" alignItems="center">
                    <Avatar
                        className="mr-2"
                        size={44}
                        src={
                            user
                                ? `http://localhost:8080/gym/api/v1/images/${user.description}`
                                : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
                        }
                        onClick={() => setDrawerVisible(true)} // Mở Drawer khi nhấn
                    />
                    <Text className="font-bold text-xl">{user ? user.name : "User"}</Text>
                </Box>
            </Box>
            <Input.Search placeholder="Search" className="w-full" />
        </Box>
    );
};

export default SelectUser;