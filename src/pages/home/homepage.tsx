import { Box, Button, Text } from "zmp-ui";

function HomePage() {
  return (
    <Box className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-200 to-blue-400">
      <Text.Title size="xLarge" className="font-bold">Welcome to Fitness App!</Text.Title>
      <Text className="mt-2 text-gray-600">You have successfully completed the onboarding process.</Text>
    </Box>
  );
}

export default HomePage;
