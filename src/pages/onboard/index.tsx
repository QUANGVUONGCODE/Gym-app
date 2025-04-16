
import { Box, Button, Page, Text } from "zmp-ui";
import bg from "@/static/bg.svg";
import { useAppNavigation } from "@/utils/navigation";

function LandingPage() {
  const { goToOnboard1 } = useAppNavigation();
  return (
    <Page
      className="flex flex-col items-center justify-center h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
      title="FitnessX"
    >
      <Box className="text-center">
        <Text.Title size="xLarge" className="font-bold">FitnessX</Text.Title>
        <Text className="mt-2 text-gray-600">Everybody Can Train</Text>
        <Box mt={6}>
          <Button
            variant="primary"
            className="bg-blue-500 text-white"
            onClick={goToOnboard1}
          >
            Get Started
          </Button>
        </Box>
      </Box>
    </Page>
  );
}

export default LandingPage;
