import { Box, Button, Page, Text } from "zmp-ui";
import img3 from "@/assets/onboard/3.png";
import { useAppNavigation } from "@/utils/navigation";

function TrackGoalPage3() {
    const { gotoOnboard4 } = useAppNavigation();
    return (
        <Page className="flex flex-col items-center justify-between h-screen bg-gradient-to-br from-blue-200 to-blue-400">
            {/* Hình ảnh minh họa */}
            <Box className="flex-1 flex items-center justify-center">
                <img
                    src={img3} // Đường dẫn đến hình minh họa
                    alt="Track Goal Illustration"
                    className="w-3/4"
                />
            </Box>

            {/* Tiêu đề và mô tả */}
            <Box className="text-center px-4 mb-8">
                <Text.Title size="large" className="font-bold">
                    Eat Well
                </Text.Title>
                <Text className="mt-2 text-gray-600">
                    Let's start a healthy lifestyle with us, we can determine your diet every day. healthy eating is fun        </Text>
            </Box>

            {/* Nút mũi tên */}
            <Box mb={4}>
                <Button
                    className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center"
                    onClick={gotoOnboard4}
                >
                    ➔
                </Button>
            </Box>
        </Page>
    );
}

export default TrackGoalPage3;