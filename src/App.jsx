import { FrappeProvider } from 'frappe-react-sdk'
import { RouterProvider,createBrowserRouter, Navigate } from "react-router-dom";
import NavigationGuard from './NavigationGuard';
import {HeroUIProvider} from '@heroui/react'
import { AppProvider } from './contexts/AppContext'
import { UserProvider } from './contexts/UserContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import 'react-toastify/dist/ReactToastify.css'



import Landing from './views/Landing'
import Login from './views/Login'
import SignUp from './views/SignUp'
import CarValuation from './views/CarValuation'
import CarSubmission from './views/CarSubmission'
import Dashboard from './views/Dashboard'
import SubmissionDetails from './views/SubmissionDetails'
import Homepage from './views/Homepage'
import NotFound from './views/NotFound'
import Layout from './components/Layout'

const routes = [
	{
	path: "/frontend",
	element: <NavigationGuard><Layout /></NavigationGuard>,
	children: [
	{
		index: true,
		element: <Landing />
	},
	{
		path: "login",
		element: <Login />
	},
	{
		path: "signup",
		element: <SignUp />
	},
	{
		path: "valuation",
		element: <CarValuation />
	},
	{
		path: "submission",
		element: <CarSubmission />
	},
	{
		path: "dashboard",
		element: <Dashboard />
	},
	{
		path: "submission/:submissionId",
		element: <SubmissionDetails />
	},
	{
		path: "home",
		element: <Homepage />
	}]
},
{
	path: "*",
	element: <NotFound />
}
]
const router = createBrowserRouter(routes)

export default function App() {

  return (
	<div id="App">
	  <FrappeProvider>
		<HeroUIProvider>
			<ThemeProvider>
				<LanguageProvider>
					<AppProvider>
						<UserProvider>
							<RouterProvider router={router} />
						</UserProvider>
					</AppProvider>
				</LanguageProvider>
			</ThemeProvider>
		</HeroUIProvider>
	  </FrappeProvider>
	</div>
  )
}

