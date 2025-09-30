import { Outlet } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { useAppContext } from '../contexts/AppContext'
import Navbar from './Navbar';
import LoadingIndicator from './LoadingIndicator';

const contextClass = {
  success: " border-[#00a896]",
  error: " border-[#e74d3c]",
  info: " border-[#3498db]",
  warning: " border-[#f1c40f]",
  default: "",
  dark: " font-gray-300",
};
export default function Layout() {
  const { isLoading } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <main className="relative">
        {isLoading && <LoadingIndicator />}
        <Outlet />
        <ToastContainer
          toastClassName={(context) =>
            contextClass[context?.type || "default"] +
            " toast-className"
          }
          className="toast-container !top-[7%]"
          autoClose={2000}
          bodyClassName= "toast-body"
          progressClassName= "toast-progress"
        />
      </main>
    </div>
  );
}   