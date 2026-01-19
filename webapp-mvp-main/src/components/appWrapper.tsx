import React, { useEffect } from "react";
import useUserStore from "@/store/userStore";
import { useClerk } from "@clerk/clerk-react";
import axios from "axios";

const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const clerk = useClerk();
  const userId = (clerk as any).userId;
  const isSignedIn = (clerk as any).isSignedIn;

  useEffect(() => {
    const fetchUser = async () => {
      if (!isSignedIn) {
        clearUser();
        return;
      }

      try {
        const res = await axios.get("/api/users/me");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, [isSignedIn, userId, setUser, clearUser]);

  return <>{children}</>;
};

export default AppWrapper;
