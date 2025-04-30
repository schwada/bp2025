import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './providers/AuthProvider';
import Dashboard from './app/dashboard/Dashboard';
import LoginPage from './app/login/LoginPage';
import List from './app/dashboard/List';
import Auth from './app/login/Auth';
import Detail from './app/dashboard/Detail';

export const queryClient = new QueryClient();

const router = createBrowserRouter([
	{ 
		path: "auth",
		element: (<Auth />),
		children: [
			{ path: "login", element: (<LoginPage />) }
		]
	},
	{
		path: "dashboard",
		element: (<Dashboard />),
		children: [
			{ index: true, path: "", element: (<List />) },
			{ path: "request/:id", element: (<Detail />) }
		]
	},
	{
		path: "*",
		element: (<Navigate to="/dashboard" />)
	}
]);

createRoot(document.getElementById('root')!).render(
	<QueryClientProvider client={queryClient}>
		<AuthProvider>
			<RouterProvider router={router} />
		</AuthProvider>
	</QueryClientProvider>
)
