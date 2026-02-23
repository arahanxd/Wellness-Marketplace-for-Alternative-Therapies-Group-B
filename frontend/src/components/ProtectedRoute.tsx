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

    // Only redirect to login if there is no token at all
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If a specific role is required and the user's role doesn't match, redirect home
    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
