import { Box, Button, Text, Input } from "zmp-ui"; // ZMP UI components
import { useAppNavigation } from "@/utils/navigation";
const CreateAccountPage = () => {

    const { goToLoggin } = useAppNavigation();
    return (
        <Box className="flex flex-col justify-center items-center h-screen bg-gray-100 p-6">
            {/* Header */}
            <Box className="w-full max-w-md text-center">
                <Text.Title size="large" className="font-bold mb-2">CREATE ACCOUNTS</Text.Title>
                <Text className="text-gray-600 mb-6">Please enter your credentials to proceed</Text>

                {/* Full Name */}
                <Box className="mb-4">
                    <Input
                        type="text"
                        placeholder="Full Name"
                        className="w-full p-3 rounded-lg border border-gray-300"
                        defaultValue="John Welles"
                    />
                </Box>

                {/* Phone */}
                <Box className="mb-4">
                    <Input
                        type="text"
                        placeholder="Phone"
                        className="w-full p-3 rounded-lg border border-gray-300"
                        defaultValue="9876543210"
                    />
                </Box>

                {/* Email Address */}
                <Box className="mb-4">
                    <Input
                        type="text"
                        placeholder="Email address"
                        className="w-full p-3 rounded-lg border border-gray-300"
                        defaultValue="johnwelles@gmail.com"
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

                {/* Create Account Button */}
                <Box className="mb-4">
                    <Button
                        className="w-full p-3 bg-green-500 text-white rounded-lg font-semibold"
                        onClick={() => console.log("Create Account clicked")}
                    >
                        CREATE ACCOUNT
                    </Button>
                </Box>

                {/* Social Media Login Buttons */}
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

                {/* Login Link */}
                <Box className="text-center">
                    <Text className="text-sm text-gray-600">
                        Already have an account? <a href=""  className="text-blue-500" onClick={goToLoggin}>Login!</a>
                    </Text>
                </Box>
            </Box>
        </Box>
    );
};

export default CreateAccountPage;
