  import { getSystemInfo } from "zmp-sdk";
  import {
    AnimationRoutes,
    App,
    Route,
    SnackbarProvider,
    ZMPRouter,
  } from "zmp-ui";
  import { AppProps } from "zmp-ui/app";

  import TrackGoalPage1 from "@/pages/onboard/onboard1";
  import TrackGoalPage2 from "@/pages/onboard/onboard2";
  import TrackGoalPage3 from "@/pages/onboard/onboard3";
  import TrackGoalPage4 from "@/pages/onboard/onboard4";
  import LandingPage from "@/pages/onboard/index";
  import HomePage from "@/pages/home/homepage";
import LoginPage from "@/pages/signup/loggin";
import CreateAccountPage from "@/pages/signup/register";

  const Layout = () => {
    return (
      <App theme={getSystemInfo().zaloTheme as AppProps["theme"]}>
        <SnackbarProvider>
          <ZMPRouter>
            <AnimationRoutes>
              <Route path="/" element={<LandingPage />}></Route>
              <Route path="/onboard1" element={<TrackGoalPage1 />}></Route>
              <Route path="/onboard2" element={<TrackGoalPage2 />}></Route>
              <Route path="/onboard3" element={<TrackGoalPage3 />}></Route>
              <Route path="/onboard4" element={<TrackGoalPage4 />}></Route>
              <Route path="/index" element={<HomePage />}></Route>
              <Route path="/loggin" element={<LoginPage />}></Route>
              <Route path="/register" element={<CreateAccountPage />}></Route>
            </AnimationRoutes>
          </ZMPRouter>
        </SnackbarProvider>
      </App>
    );
  };
  export default Layout;
