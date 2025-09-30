import { useState, createContext, useContext, useEffect } from 'react'
import { useAppContext } from './AppContext'
import { useFrappeAuth } from 'frappe-react-sdk';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { setIsLoading } = useAppContext();
  const [isLoggdedIn, setIsLoggdedIn] = useState(false);
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
    const storedUser = localStorage.getItem('wecars_user');
    
    if (apiKey && storedUser) {
      try {
        setCurrUser(JSON.parse(storedUser));
        setIsLoggdedIn(true);
        return;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid data
        localStorage.clear()
      }
    }

    // If no stored credentials, set as not logged in
    if (!apiKey) {
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
      async function getFullUser() {
        try {
          // get user from frappe get doc
          const res = await fetch(`/api/resource/User/${userEmail}`)
          const user = await res.json();
          setCurrUser(user.data);
          setIsLoggdedIn(true);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setIsLoggdedIn(false);
          setCurrUser(null);
        }
      }
      getFullUser();
    } else {
      console.log('No current user, not logged in');
      // No current user, not logged in
      localStorage.clear()
      setIsLoggdedIn(false);
      setCurrUser(null);
    }
  }, [userEmail, isValidating, authLoading, setIsLoading]);

  const myLogout = () => {
    setIsLoading(true);
    // Use Frappe auth logout
    logout();
    setIsLoading(false);
    // clear localStorage from all things
    localStorage.clear()
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