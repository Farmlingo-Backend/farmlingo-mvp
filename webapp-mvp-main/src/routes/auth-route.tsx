
// import { useUser } from '@clerk/clerk-react';
// import { Navigate, Outlet } from 'react-router';

// function AuthRoute({ children }: { children?: React.ReactNode }) {
//   const { isSignedIn, isLoaded } = useUser();

//   if (!isLoaded) {
//     return <div>Loading...</div>;
//   }

//   if (isSignedIn) {
//     return <Navigate to='/virtual-farm' replace />;
//   }

//   return children ? children : <Outlet />;
// }

// export default AuthRoute;

import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router";

export default function AuthRoute({ children }: { children?: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  if (isSignedIn) {
    return <Navigate to="/" />;
  }

  return children || <Outlet />;
}