
import { Routes, Route, Navigate } from "react-router";
import { useUser} from "@clerk/clerk-react";
import { useEffect } from "react";
import useUserStore from "@/store/userStore";

import ProtectedRoutes from "./routes/protected-route";
import AppLayout from "./layouts/app-layout";
import AuthRoute from "./routes/auth-route";
import AuthLayout from "./layouts/auth-layout";

import LogIn from "./pages/auth/log-in";
import SignUp from "./pages/auth/sign-up";
import ForgotPassword from "./pages/auth/forgot-password";

import VirtualFarm from "./pages/virtual-farm";
import CoursesPages from "./pages/learn/courses";
import QuizPages from "./pages/learn/quiz";
import MaterialsPages from "./pages/learn/learning-materials";
import Feeds from "./pages/community/feeds";
import Chatrooms from "./pages/community/chatrooms";
import ChatsPage from "./pages/community/chats";
import CourseDetailsPage from "./pages/learn/components/course-details-page";
import CourseLessonsPage from "./pages/learn/course-lesson";
import CreateChatroom from "./components/chatroom/createChatroom";

function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      setUser({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        fullName: user.fullName || "",
        imageUrl: user.imageUrl || "",
      });
    } else {
      setUser({ id: "", email: "", name: "" });
    }
  }, [isLoaded, isSignedIn, user, setUser]);

  if (!isLoaded) {
    return <div>Loading...</div>; 
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <AuthRoute>
            <AuthLayout />
          </AuthRoute>
        }
      >
        <Route index element={<Navigate to="log-in" replace />} />
        <Route path="log-in" element={<LogIn />} />
        <Route path="sign-up" element={<SignUp />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route
        element={
          <ProtectedRoutes>
            <AppLayout />
          </ProtectedRoutes>
        }
      >
        <Route path="/" index element={<VirtualFarm />} />

        <Route path="/learn">
          <Route index element={<Navigate to="courses" replace />} />
          <Route path="courses" element={<CoursesPages />} />
          <Route path="courses/:id" element={<CourseDetailsPage />} />
          <Route path="courses/:id/lessons" element={<CourseLessonsPage />} />
          <Route path="quiz" element={<QuizPages />} />
          <Route path="materials" element={<MaterialsPages />} />

        </Route>

        <Route path="/community">
          <Route index element={<Navigate to="feeds" replace />} />
          <Route path="feeds" element={<Feeds />} />
          <Route path="chatrooms" element={<Chatrooms />} />
          <Route path="chats" element={<ChatsPage />} />
          <Route path="chats/:userId" element={<ChatsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
                <Route path="/form" element={<CreateChatroom />} />

    </Routes>
  );
}

export default App;
