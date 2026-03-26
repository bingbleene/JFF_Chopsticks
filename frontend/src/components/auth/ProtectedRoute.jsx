import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

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
    return (
      <div className="flex h-screen items-center justify-center">
        Đang tải trang...
      </div>
    );
  }

  if (!useAuthStore.getState().accessToken) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;