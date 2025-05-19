import { Box, Button, Text, Input } from "zmp-ui"; // ZMP UI components
import { useAppNavigation } from "@/utils/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useState } from "react";

const CreateAccountPage = () => {
    const { goToLoggin } = useAppNavigation();
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); // Error state
    const [phoneError, setPhoneError] = useState<string | null>(null); // Lỗi riêng cho số điện thoại

    // Hàm gọi API để tạo tài khoản mới
    const createAccount = async () => {
        setLoading(true);
        setError(null); // Reset lỗi trước khi gửi yêu cầu
        setPhoneError(null); // Reset lỗi số điện thoại trước khi gửi yêu cầu

        // Dữ liệu gửi lên API
        const payload = {
            name: fullName,
            phone_number: phone,
            email: email,
            password: password,
        };

        try {
            const response = await fetch("http://localhost:8080/gym/api/v1/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept-Language": "vi",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Error creating account");
            }

            const data = await response.json();
            console.log("Create Account Response Data:", data);

            if (data.code === 0) {
                // Điều hướng đến trang đăng nhập hoặc trang chính sau khi tạo tài khoản thành công
                goToLoggin(); 
            } else {
                throw new Error("Failed to create account");
            }
        } catch (error: any) {
            if (error.message.includes("Phone number already exists")) {
                setPhoneError("Phone number already exists"); // Hiển thị lỗi riêng cho phone
            } else {
                setError(error.message || "Error creating account");
            }
            console.error("Error creating account:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="flex flex-col justify-center items-center h-screen bg-gray-100 p-6 mt-16">
            {/* Header */}
            <Box className="w-full max-w-md text-start">
                <Text.Title size="large" className="font-bold mb-2">CREATE ACCOUNTS</Text.Title>
                <Text className="text-gray-600 mb-6">Please enter your credentials to proceed</Text>

                {/* Full Name */}
                <Box className="mb-4">
                    <Text className="text-start font-semibold ">Full Name</Text>
                    <Input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full p-3 rounded-lg border border-gray-300"
                    />
                </Box>

                {/* Phone */}
                <Box className="mb-4">
                    <Text className="text-start font-semibold ">Phone</Text>
                    <Input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone"
                        className="w-full p-3 rounded-lg border border-gray-300"
                    />
                    {/* Hiển thị lỗi cho số điện thoại */}
                    {phoneError && <Text className="text-red-500 text-sm mt-1">{phoneError}</Text>}
                </Box>

                {/* Password */}
                <Box className="mb-4">
                    <Text className="text-start font-semibold ">Password</Text>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full p-3 rounded-lg border border-gray-300"
                    />
                </Box>
                {/* Email Address */}
                <Box className="mb-4">
                    <Text className="text-start font-semibold ">Email Address</Text>
                    <Input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        className="w-full p-3 rounded-lg border border-gray-300"
                    />
                </Box>


                {/* Create Account Button */}
                <Box className="mb-4">
                    <Button
                        className="w-full p-3 bg-green-500 text-white rounded-lg font-semibold"
                        onClick={createAccount} // Gọi hàm tạo tài khoản khi nhấn nút
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "CREATE ACCOUNT"}
                    </Button>
                </Box>

                {/* Social Media Login Buttons */}
                <Box className="flex justify-center space-x-4 mb-4">
                    <Button className="flex-1 p-3 bg-white border border-gray-300 rounded-lg flex items-center justify-center text-black">
                        <FontAwesomeIcon icon={faGoogle} className="w-5 h-5 mr-2" />
                        Connect with Google
                    </Button>
                </Box>

                <Box className="flex justify-center space-x-4 mb-6">
                    <Button className="flex-1 p-3 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon icon={faFacebook} className="w-5 h-5 mr-2 " />
                        Connect with Facebook
                    </Button>
                </Box>

                {/* Error Message */}
                {error && (
                    <Box className="text-red-500 text-center mt-4">
                        <Text>{error}</Text>
                    </Box>
                )}

                {/* Login Link */}
                <Box className="text-center">
                    <Text className="text-sm text-gray-600 mb-4">
                        Already have an account? <a href="#" className="text-blue-500" onClick={goToLoggin}>Login!</a>
                    </Text>
                </Box>
            </Box>
        </Box>
    );
};

export default CreateAccountPage;
