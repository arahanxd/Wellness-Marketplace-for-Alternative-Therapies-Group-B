import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const location = useLocation();
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');
    const emailVerified = localStorage.getItem('emailVerified') === 'true';

    if (!token) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Redirect to otp verification if email not verified
    // We check if emailVerified is not 'true' AND the role is not 'ADMIN' (Admin usually doesn't need OTP)
    if (token && userRole !== 'ADMIN' && !emailVerified && location.pathname !== '/otp-verification') {
        console.warn(`PROTECTED ROUTE: User not verified. Redirecting from ${location.pathname} to /otp-verification`);
        return <Navigate to="/otp-verification" replace />;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        // Redirect to unauthorized or home if role not allowed
        return <Navigate to="/" replace />;
    }

    return children;
}
