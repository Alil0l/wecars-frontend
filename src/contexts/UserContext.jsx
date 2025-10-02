import { useState, createContext, useContext, useEffect } from 'react'
import { useAppContext } from './AppContext'
import { useFrappeAuth } from 'frappe-react-sdk';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { setIsLoading } = useAppContext();
  const [isLoggdedIn, setIsLoggdedIn] = useState(true);
  const [currUser, setCurrUser] = useState(null);
  const [newNotification, setNewNotification] = useState(false);
  
  const {
    currentUser: userEmail,
    isValidating,
    isLoading: authLoading,
    login,
    logout,
    error,
    updateCurrentUser,
    getUserCookie,
  } = useFrappeAuth();

  useEffect(() => {
    setIsLoading(authLoading);

    // Check for api key in localStorage if it exists then set as logged in
    const apiKey = localStorage.getItem('wecars_api_key');
    const apiSecret = localStorage.getItem('wecars_api_secret');
    const storedUser = localStorage.getItem('wecars_user');
    
    if (apiKey && apiSecret && storedUser) {
        setCurrUser(JSON.parse(storedUser));
        setIsLoggdedIn(true);
      }

    // If no stored credentials, set as not logged in
    if (!apiKey || !apiSecret) {
      setIsLoggdedIn(false);
      setCurrUser(null);
      return;
    }

    // If still validating auth state, wait
    if (isValidating) {
      return;
    }

    // If we have a current user from Frappe auth
    if (userEmail) {
      setCurrUser(JSON.parse(storedUser));
      setIsLoggdedIn(true);
    } else {
      localStorage.removeItem('wecars_api_key');
      localStorage.removeItem('wecars_api_secret');
      localStorage.removeItem('wecars_user');
      setIsLoggdedIn(false);
      setCurrUser(null);
    }
  }, [userEmail, isValidating, authLoading, setIsLoading]);

  const myLogout = () => {
    setIsLoading(true);
    // Use Frappe auth logout
    logout();
    setIsLoading(false);
    // clear localStorage from WeCars specific items
    localStorage.removeItem('wecars_api_key');
    localStorage.removeItem('wecars_api_secret');
    localStorage.removeItem('wecars_user');
    // Reset state
    setCurrUser(null);
    setIsLoggdedIn(false);
  };

  return (
    <UserContext.Provider value={{ 
      currUser, 
      setCurrUser,
      isLoggdedIn, 
      setIsLoggdedIn,
      newNotification, 
      setNewNotification,
      logout: myLogout,
      login,
      error
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => {
  return useContext(UserContext);
}