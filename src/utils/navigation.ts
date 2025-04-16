import { useNavigate } from "zmp-ui";

// Custom hook dùng ở bất kỳ component nào
export const useAppNavigation = () => {
  const navigate = useNavigate();

  return {
    goToOnboard1: () => navigate("/onboard1"),
    goToOnboard2: () => navigate("/onboard2"),
    gotoOnboard3: () => navigate("/onboard3"),
    gotoOnboard4: () => navigate("/onboard4"),
    goToHome: () => navigate("/"),
    goToDashboard: () => navigate("/dashboard"),
    goToIndex:() => navigate("/index"),
    goToLoggin:() => navigate("/loggin"),
    goToRegister:() => navigate("/register"),
  };
};