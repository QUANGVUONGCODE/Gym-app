import { AnimationRoutes, Route } from "zmp-ui"; // Không cần ZMPRouter nữa

import TrackGoalPage1 from "@/pages/onboard/onboard1";
import TrackGoalPage2 from "@/pages/onboard/onboard2";
import TrackGoalPage3 from "@/pages/onboard/onboard3";
import TrackGoalPage4 from "@/pages/onboard/onboard4";
import LandingPage from "@/pages/onboard/index";
import HomePage from "@/pages/home/homepage";
import LoginPage from "@/pages/signup/loggin";
import CreateAccountPage from "@/pages/signup/register";
import CategoryPage from "@/pages/catgories";
import Profile from "./footer/profiles/profile";
import TranningPage from "@/pages/tranning";
import EditProfile from "@/pages/profile/updateprofile";
import Exercise from "@/pages/exercise";
import ExerciseDetail from "@/pages/exercisedetail";
import MealPlan from "@/pages/mealplan";
import MealPlanDetail from "@/pages/mealdetail";
import Favorite from "@/pages/favorites";
import Dashboard from "@/pages/dashboard";
import TrainScreen from "./train";
import ResultScreen from "./result";
import ExerciseByCategories from "@/pages/exercisebycategories";


const Layout = () => {
  return (
    <AnimationRoutes>
      <Route path="/" element={<LandingPage />}></Route>
      <Route path="/onboard1" element={<TrackGoalPage1 />}></Route>
      <Route path="/onboard2" element={<TrackGoalPage2 />}></Route>
      <Route path="/onboard3" element={<TrackGoalPage3 />}></Route>
      <Route path="/onboard4" element={<TrackGoalPage4 />}></Route>
      <Route path="/index" element={<HomePage />}></Route>
      <Route path="/loggin" element={<LoginPage />}></Route>
      <Route path="/register" element={<CreateAccountPage />}></Route>
      <Route path="/categories" element={<CategoryPage />}></Route>
      <Route path="/profile" element={<Profile />}></Route>
      <Route path="/training" element={<TranningPage />}></Route>
      <Route path="/editprofile" element={<EditProfile />}></Route>
      <Route path="/exercise" element={<Exercise />}></Route>
      <Route path="/exercise/:id" element={<ExerciseDetail />}></Route>
      <Route path="/mealplan" element={<MealPlan />}></Route>
      <Route path="/mealplan/:id" element={<MealPlanDetail />}></Route>
      <Route path="/favorite" element={<Favorite />}></Route>
      <Route path="/dashboard" element = {<Dashboard/>}></Route>
      <Route path="/train/:id" element={<TrainScreen />}></Route>
      <Route path="/result/:id" element={<ResultScreen />}></Route>
      <Route path="/categories/:id" element={<ExerciseByCategories />}></Route>
    </AnimationRoutes>
  );
};

export default Layout;
