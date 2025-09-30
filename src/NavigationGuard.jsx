import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import { toast } from 'react-toastify';
// import axios from 'axios';
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
            const publicRoutes = ["/frontend/", "/frontend/login", "/frontend/signup"];

            // Check if current route is public
            const isPublicRoute = publicRoutes.includes(pathname);

            // // If logged in user tries to access public routes, redirect to home
            // if (isPublicRoute && isLoggdedIn) {
            //     navigate("/frontend/", { replace: true });
            //     return;
            // }

            // // Allow access to public routes for non-logged in users
            // if (isPublicRoute && !isLoggdedIn) {
            //     return;
            // }

            // // Check authentication
            // if (!isLoggdedIn) {
            //     navigate("/frontend/login", { replace: true });
            //     return;
            // }

        };

        checkNavigation();
    }, [location, isLoggdedIn, navigate, setIsLoading]);

    return children;
};

export default NavigationGuard;