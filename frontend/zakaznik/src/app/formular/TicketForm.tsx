import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Step } from "./Formular"
import { useMutation } from "@tanstack/react-query"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function TicketForm({ className, setStep, setOrder, ...props }: React.ComponentPropsWithoutRef<"div"> & { 
	setStep: (step: number) => void,
	setOrder: (order: any) => void
}) {
	
	const [email, setEmail] = useState("");
	const [orderNumber, setOrderNumber] = useState("");
	const getProductsMutation = useMutation({
		mutationFn: () => fetch(`${import.meta.env.VITE_API_URL}/api/order?email=${email}&orderNumber=${orderNumber}`).then(res => {
			if(!res.ok) throw new Error("Email nebo číslo objednávky je chybné.");
			return res.json();
		}),
		onSuccess:(res) => {
			setOrder(res);
			setStep(Step.Products);
		}
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		getProductsMutation.mutate();
	}

	return (
		<div className={cn("flex flex-col gap-3", className)} {...props}>
			{getProductsMutation.isError && (
				<Alert variant="destructive">
					<AlertTitle>Chyba</AlertTitle>
					<AlertDescription>
						Vaše emailová adresa nebo číslo objednávky je chybné.
					</AlertDescription>
				</Alert>
			)}
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Vratit zbozi</CardTitle>
					<CardDescription>Zadejte Vaši emailovou adresu a číslo objednávky.</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<div className="flex flex-col gap-6">
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input id="email" type="email" placeholder="m@example.com" required 
								value={email} disabled={getProductsMutation.isPending}
								onChange={(e) => setEmail(e.target.value)}/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="orderNumber">Číslo objednávky</Label>
								<Input id="orderNumber" type="number" required placeholder="1234567890"
								value={orderNumber} disabled={getProductsMutation.isPending} 
								onChange={(e) => setOrderNumber(e.target.value)}/>
							</div>
							<Button className="w-full cursor-pointer" 
							type="submit" disabled={getProductsMutation.isPending}>Další krok</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
