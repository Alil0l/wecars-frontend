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
    currentUser,
    isValidating,
    isLoading: authLoading,
    login,
    logout,
    error,
    updateCurrentUser,
    getUserCookie,
  } = useFrappeAuth();

  // Check for Guest user in cookies
  let cookiesUser = null;
  if (document.cookie) {
    document.cookie.split(';').forEach(e => {
      e.includes('Guest') ? cookiesUser = true : null
    })
  }

  useEffect(() => {
    setIsLoading(authLoading);

    // If user is Guest, set as not logged in
    if (cookiesUser) {
      setIsLoggdedIn(false);
      setCurrUser(null);
      return;
    }

    // If still validating auth state, wait
    if (isValidating) {
      return;
    }

    // If we have a current user from Frappe auth
    if (currentUser) {
      console.log('currentUser', currentUser);
      setCurrUser(currentUser);
      setIsLoggdedIn(true);
    } else {
      // No current user, not logged in
      setIsLoggdedIn(false);
      setCurrUser(null);
    }
  }, [currentUser, isValidating, authLoading, cookiesUser]);

  const myLogout = () => {
    // Remove socket listeners
    if (currUser?.email) {
      socket.off(currUser.email);
    }
    
    // Use Frappe auth logout
    logout();
    
    // Reset state
    setCurrUser(null);
    setIsLoggdedIn(false);
    setNewNotification(false);
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