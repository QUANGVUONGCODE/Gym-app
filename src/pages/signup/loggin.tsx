import { Box, Button, Text, Input } from "zmp-ui";  // ZMP UI components
import { useAppNavigation } from "@/utils/navigation";
const LoginPage = () => {
    const {goToRegister, goToIndex} = useAppNavigation();
    return (
        <Box className="flex flex-col justify-center items-center h-screen bg-gray-100 p-6">
            {/* Header */}
            <Box className="w-full max-w-md text-center">
                <Text.Title size="large" className="font-bold mb-2">WELCOME TO PRO FITNESS!</Text.Title>
                <Text className="text-gray-600 mb-6">Hello there, sign in to continue!</Text>

                {/* Email Address */}
                <Box className="mb-4">
                    <Input
                        type="text"
                        placeholder="Phone Number"
                        className="w-full p-3 rounded-lg border border-gray-300"
                        defaultValue=""
                    />
                </Box>

                {/* Password */}
                <Box className="mb-4">
                    <Input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 rounded-lg border border-gray-300"
                    />
                </Box>

                {/* Forgot password link */}
                <Box className="text-right mb-6">
                    <Text className="text-sm text-gray-600">Forgot Password?</Text>
                </Box>

                {/* Login button */}
                <Box className="mb-4">
                    <Button
                        className="w-full p-3 bg-green-500 text-white rounded-lg font-semibold"
                        onClick={goToIndex}
                    >
                        LOGIN
                    </Button>
                </Box>

                {/* Social login buttons */}
                <Box className="flex justify-center space-x-4 mb-4">
                    <Button className="flex-1 p-3 bg-white border border-gray-300 rounded-lg flex items-center justify-center">
                        <img src="/path-to-google-icon.svg" alt="Google Icon" className="w-5 h-5 mr-2" />
                        Connect with Google
                    </Button>
                </Box>

                <Box className="flex justify-center space-x-4 mb-6">
                    <Button className="flex-1 p-3 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                        <img src="/path-to-facebook-icon.svg" alt="Facebook Icon" className="w-5 h-5 mr-2" />
                        Connect with Facebook
                    </Button>
                </Box>

                {/* Register link */}
                <Box className="text-center">
                    <Text className="text-sm text-gray-600">
                        Don’t have an account? <a  className="text-blue-500" onClick={goToRegister}>Register!</a>
                    </Text>
                </Box>
            </Box>
        </Box>
    );
};

export default LoginPage;
