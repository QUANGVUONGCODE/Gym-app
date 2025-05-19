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
    goToIndex: () => navigate("/index"),
    goToLoggin: () => navigate("/loggin"),
    goToRegister: () => navigate("/register"),
    goToCategories: () => navigate("/categories"),
    goToProfile: () => navigate("/profile"),
    goToTranning: () => navigate("/training"),
    goToEditProfile: () => navigate("/editprofile"),
    goToExercise: () => navigate('/exercise'),
    goToExerciseDetail: (id: number) => navigate(`/exercise/${id}`),
    goToMealPlan: () => navigate("/mealplan"),
    goToMealDetail: (id: number) => navigate(`/mealplan/${id}`),
    goToFavorite: () => navigate("/favorite"),
    goback: () => navigate(-1),
    goToTrainPage: (id: number) => navigate(`/train/${id}`),
    goToResult: (id: number, state?: any) => navigate(`/result/${id}`, { state }),
    goToExerciseByCategoryId: (id: number) => navigate(`/categories/${id}`),
  };
};