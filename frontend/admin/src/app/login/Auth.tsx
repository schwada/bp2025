import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../../providers/AuthProvider";

export default function Auth() {

	const navigate = useNavigate();
	const { user } = useAuth();
	
	useEffect(() => {
		if (user) navigate("/dashboard");
	}, [user]);

	return (<Outlet/>);
}