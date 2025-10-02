import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useAppContext } from "./contexts/AppContext";
import { useUserContext } from "./contexts/UserContext";

const NavigationGuard = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setIsLoading } = useAppContext();
    const { isLoggdedIn } = useUserContext();

    useEffect(() => {
        const checkNavigation = async () => {
            const { pathname } = location;
            const publicRoutes = ["/", "/login", "/signup"];

            // Check if current route is public
            const isPublicRoute = publicRoutes.includes(pathname);

            // If logged in user tries to access login/signup, redirect to dashboard
            if ((pathname === "/login" || pathname === "/signup") && isLoggdedIn) {
                navigate("/dashboard", { replace: true });
                return;
            }

            // Allow access to public routes for non-logged in users
            if (isPublicRoute && !isLoggdedIn) {
                return;
            }

            // Check authentication for protected routes
            if (!isLoggdedIn) {
                navigate("/login", { replace: true });
                return;
            }

        };

        checkNavigation();
    }, [location, isLoggdedIn, navigate, setIsLoading]);

    return children;
};

export default NavigationGuard;