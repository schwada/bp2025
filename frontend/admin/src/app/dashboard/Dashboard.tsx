import { Outlet } from "react-router";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../providers/AuthProvider";

export default function Dashboard() {

	const navigate = useNavigate();
	const { user } = useAuth();
	
	useEffect(() => {
		if (!user) navigate("/auth/login");
	}, [user]);

	return (
		<div className="flex flex-col items-center justify-center h-screen"> 
			<Outlet/>
		</div>
	);
}