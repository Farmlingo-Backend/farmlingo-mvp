// import { Spinner } from '@/components/ui/spinner';
// import { useUser } from '@clerk/clerk-react';
// import { Navigate, Outlet } from 'react-router';

// function ProtectedRoutes({ children }: { children?: React.ReactNode }) {
//   const { isSignedIn, isLoaded } = useUser();

//   if (!isLoaded) {
//     return (
//       <div className='flex w-full h-screen items-center justify-center'>
//         <Spinner />
//       </div>
//     );
//   }

//   if (!isSignedIn) {
//     return <Navigate to='/auth/log-in' replace />;
//   }

//   return children ? children : <Outlet />;
// }

// export default ProtectedRoutes;



import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router";

export default function ProtectedRoutes({ children }: { children?: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  if (!isSignedIn) {
    return <Navigate to="/auth/log-in" />;
  }

  return children || <Outlet />;
}