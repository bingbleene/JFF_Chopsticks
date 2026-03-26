import { useAuthStore } from '@/stores/useAuthStore'
import React, { use, useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import { set } from 'zod';

const ProtectedRoute = () => {
    const {accessToken, user,  loading, refresh, fetchMe} = useAuthStore();
    const [starting, setStarting] = useState(true);

    const init = async () => {
      try {
        if (!accessToken) {
          await refresh();
        }
        if (accessToken && !user) {
          await fetchMe();
        }
      } catch (e) {
        // log lỗi nếu có
        console.error(e);
      } finally {
        setStarting(false);
      }
    }

    useEffect(() => {
      init();
    }, []);
    
    if (starting || loading) {
      return (
        <div className="flex h-screen items-center justify-center">Loading...</div>
      );
    }

    if (!accessToken) {
        return (
            <Navigate 
            to="/signin" 
            replace
            />
        )
    }

  return (
    <Outlet />
  )
}

export default ProtectedRoute