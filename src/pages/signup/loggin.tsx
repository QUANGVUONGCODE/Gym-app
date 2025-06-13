import { Box, Button, Text, Input } from "zmp-ui";
import { useAppNavigation } from "@/utils/navigation";
import { faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { login, logout, isAuthenticated, getUserResponseFromLocalStorage, getUserRole } from "@/utils/user";

const LoginPage = () => {
  const { goToRegister, goToIndex, goToAdminDashboard } = useAppNavigation(); // Add goToAdminDashboard
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await login(phoneNumber, password);
      if (response.code === 0 && response.result.authenticated) {
        const userResponse = getUserResponseFromLocalStorage();
        console.log('User info saved to localStorage:', userResponse);

        // Check the user's role
        const userRole = getUserRole();
        console.log('User role:', userRole);

        if (userRole === "ROLE_ADMIN") {
          goToAdminDashboard(); // Redirect to admin dashboard if role is ROLE_ADMIN
        } else {
          goToIndex(); // Redirect to home page for non-admin users
        }
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setPhoneNumber("");
    setPassword("");
    setError(null);
  };

  return (
    <Box className="flex flex-col justify-center items-center h-screen bg-gray-100 p-6">
      <Box className="w-full max-w-md text-center">
        <Text.Title size="large" className="font-bold mb-2">
          WELCOME TO PRO FITNESS!
        </Text.Title>
        <Text className="text-gray-600 mb-6">Hello there, sign in to continue!</Text>

        {isAuthenticated() ? (
          <Box className="mb-6">
            <Text className="mb-4">You are already logged in.</Text>
            <Button
              className="w-full p-3 bg-red-500 text-white rounded-lg font-semibold"
              onClick={handleLogout}
            >
              LOGOUT
            </Button>
          </Box>
        ) : (
          <>
            {/* Phone Number */}
            <Box className="mb-4">
              <Text className="text-start font-semibold">Phone Number</Text>
              <Input
                type="text"
                placeholder="Phone Number"
                className="w-full p-3 rounded-lg border border-gray-300"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </Box>

            {/* Password */}
            <Box className="mb-4">
              <Text className="text-start font-semibold">Password</Text>
              <Input
                type="password"
                placeholder="Password"
                className="w-full p-3 rounded-lg border border-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Box>

            {/* Error message */}
            {error && (
              <Box className="mb-4">
                <Text className="text-red-500">{error}</Text>
              </Box>
            )}

            {/* Forgot password link */}
            <Box className="text-right mb-6">
              <Text className="text-sm text-gray-600">Forgot Password?</Text>
            </Box>

            {/* Login button */}
            <Box className="mb-4">
              <Button
                className="w-full p-3 bg-green-500 text-white rounded-lg font-semibold"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Logging in..." : "LOGIN"}
              </Button>
            </Box>

            
            {/* Register link */}
            <Box className="text-center">
              <Text className="text-sm text-gray-600">
                Don’t have an account?{" "}
                <a className="text-blue-500" onClick={goToRegister}>
                  Register!
                </a>
              </Text>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default LoginPage;