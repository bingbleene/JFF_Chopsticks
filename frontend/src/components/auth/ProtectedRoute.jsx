import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { SpinnerEmpty } from "@/components/ui/SpinnerEmpty";

const ProtectedRoute = () => {
  const { loading, refresh, fetchMe } = useAuthStore();
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await refresh(); // luôn gọi

        const { accessToken, user } = useAuthStore.getState();

        if (accessToken && !user) {
          await fetchMe();
        }
      } catch (e) {
        console.error(e);
      } finally {
        setStarting(false);
      }
    };

    init();
  }, []);

  if (starting || loading) {
    return <SpinnerEmpty />;
  }

  if (!useAuthStore.getState().accessToken) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;