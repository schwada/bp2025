import { UseMutationResult, useMutation } from '@tanstack/react-query';
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthContextType {
    user: { username: string } | null;
	isLoading: boolean;
	loginMutation: UseMutationResult<any, Error, { email: string; password: string; }, unknown>;
	checkAuthMutation: UseMutationResult<any, Error, void, unknown>;
	logoutMutation: UseMutationResult<any, Error, void, unknown>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<{ username: string } | null>(null);
	const checkAuthMutation = useMutation({
		mutationFn: async () => {
			const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
				method: 'GET', credentials: 'include', headers: { 'Accept': 'application/json' }
			});
			if (resp.ok) return await resp.json();
			throw new Error('Failed to fetch auth status');
		},
		retry: false,
		onSuccess: (data) => setUser(data.user),
		onError: () => setUser(null)
	})

	const loginMutation = useMutation({
		mutationFn: async ({email, password}: {email: string, password: string}) => {
			const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
				method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});
			if (resp.ok) return await resp.json();
			throw new Error('Failed to login');
		},
		retry: false,
		onSuccess: (data) => setUser(data.user),
		onError: () => setUser(null)
	})


	const logoutMutation = useMutation({
		mutationFn: async () => {
			const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
			if (resp.ok) return await resp.json();
			throw new Error('Failed to logout');
		},
		onSuccess: () => setUser(null),
		onError: () => setUser(null)
	})

    useEffect(() => { 
		checkAuthMutation.mutate();
    }, []);


    return (
        <AuthContext.Provider value={{ 
			user, 
			isLoading: (checkAuthMutation.isPending || loginMutation.isPending || logoutMutation.isPending), 
			loginMutation, logoutMutation, checkAuthMutation
		}}>
			{(checkAuthMutation.isPending) ? (
				<div className="flex justify-center items-center h-screen"> Loading... </div>
			) : (
				children
			)}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};