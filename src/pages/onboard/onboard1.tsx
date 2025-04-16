import { Box, Button, Page, Text } from "zmp-ui";
import img1 from "@/assets/onboard/1.png";
import { useAppNavigation } from "@/utils/navigation";

function TrackGoalPage1() {
  const { goToHome, goToOnboard2 } = useAppNavigation();

  return (
    <Page className="flex flex-col items-center justify-between h-screen bg-gradient-to-br from-blue-200 to-blue-400">
      {/* Hình ảnh minh họa */}
      <Box className="flex-1 flex items-center justify-center">
        <img
          src={img1} // Đường dẫn đến hình minh họa
          alt="Track Goal Illustration"
          className="w-3/4"
        />
      </Box>

      {/* Tiêu đề và mô tả */}
      <Box className="text-center px-4 mb-8">
        <Text.Title size="large" className="font-bold">
          Track Your Goal
        </Text.Title>
        <Text className="mt-2 text-gray-600">
          Don’t worry if you have trouble determining your goals, We can help
          you determine your goals and track your goals
        </Text>
      </Box>

      {/* Nút mũi tên nằm ngang */}
      <Box className="flex items-center justify-center space-x-4 mb-4">
      
        <Button
          className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center"
          onClick={goToOnboard2}
        >
          ➔
        </Button>
      </Box>
    </Page>
  );
}

export default TrackGoalPage1;
