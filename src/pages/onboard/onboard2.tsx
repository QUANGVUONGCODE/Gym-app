import { Box, Button, Page, Text } from "zmp-ui";
import img2 from "@/assets/onboard/2.png";
import { useAppNavigation } from "@/utils/navigation"; // Import hook điều hướng

function TrackGoalPage2() {
    const { goToOnboard1, gotoOnboard3 } = useAppNavigation();  // Sử dụng phương thức điều hướng

    return (
        <Page className="flex flex-col items-center justify-between h-screen bg-gradient-to-br from-blue-200 to-blue-400">
            {/* Hình ảnh minh họa */}
            <Box className="flex-1 flex items-center justify-center">
                <img
                    src={img2}  // Đường dẫn đến hình minh họa
                    alt="Track Goal Illustration"
                    className="w-3/4"
                />
            </Box>

            {/* Tiêu đề và mô tả */}
            <Box className="text-center px-4 mb-8">
                <Text.Title size="large" className="font-bold">
                    Get Burn
                </Text.Title>
                <Text className="mt-2 text-gray-600">
                    Let’s keep burning, to achieve your goals. It hurts only temporarily; if you give up now, you will be in pain forever.
                </Text>
            </Box>

            {/* Nút mũi tên */}
            <Box className="flex items-center justify-center space-x-4 mb-4">
                
                <Button
                    className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center transition-transform transform"
                    onClick={gotoOnboard3}  // Điều hướng tới trang tiếp theo
                >
                    ➔
                </Button>
            </Box>
        </Page>
    );
}

export default TrackGoalPage2;
