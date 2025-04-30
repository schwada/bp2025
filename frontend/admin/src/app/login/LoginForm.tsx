import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { useAuth } from "../../providers/AuthProvider"
import { useState } from "react"
import { useNavigate } from "react-router"

export function LoginForm({className, ...props}: React.ComponentPropsWithoutRef<"div">) {

	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { loginMutation } = useAuth();
	const submit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		loginMutation.mutate({ email, password });
		navigate("/dashboard");
	}

		
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			{(loginMutation.isError) && (
				<Alert className="border-red-500" variant="destructive">
					<AlertTitle>Nesprávné přihlašovací údaje</AlertTitle>
				</Alert>
			)}
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Přihlášení</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={submit}>
						<div className="grid gap-6">	
							<div className="grid gap-6">
								<div className="grid gap-2">
									<Label htmlFor="email">Email</Label>
									<Input onChange={(e) => setEmail(e.target.value)}
									id="email" type="email" placeholder="m@example.com" required />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="password">Heslo</Label>
									<Input onChange={(e) => setPassword(e.target.value)}
									id="password" type="password" placeholder="********" required />
								</div>
								<Button type="submit" disabled={loginMutation.isPending} className="w-full">Přihlásit se</Button>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
