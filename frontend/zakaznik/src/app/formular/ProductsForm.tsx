import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function ProductsForm({ className, order, ...props }: React.ComponentPropsWithoutRef<"div"> & { order: any }) {

	const navigate = useNavigate();
	const createRequestMutation = useMutation({
		mutationFn: () => fetch(`${import.meta.env.VITE_API_URL}/api/order?email=${order.email}&orderNumber=${order.orderNumber}`, {
			method: "POST", body: JSON.stringify({ products: reasons })
		}),
		onSuccess: async (res) => {
			const data = await res.json();
			navigate("/pozadavek/" + data.id);
		},
		onError: (error) => {
			console.error(error);
		}
	});

	const [ reasons, setReasons ] = useState({});
	const submit = () => {
		console.log(reasons,order);
		createRequestMutation.mutate();
	}
	
	return (
		<div className={cn("flex flex-col gap-3", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Zvolte zbozi</CardTitle>
					<CardDescription>Zvolte důvod pro zboží, které chcete vratit.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap mb-4">
						{order.products.map((product: any) => (
							<div key={product.id} className="flex flex-col gap-2 w-full md:w-1/2 p-2">
								<div className="flex items-center gap-2 rounded-md border p-4">
									<div className="h-12 w-12 rounded-md bg-gray-200" />
									<div className="flex flex-col">
										<p className="text-sm font-medium">Bratislava</p>
										<p className="text-sm text-muted-foreground">52$</p>
									</div>
								</div>
								<div className="flex gap-2 items-center">
									<Select onValueChange={(value) => setReasons({...reasons, [product.id]: value})}>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Vyberte důvod vrácení" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="light">Light</SelectItem>
											<SelectItem value="dark">Dark</SelectItem>
											<SelectItem value="system">System</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						))}
					</div>					
					<Button type="submit" disabled={createRequestMutation.isPending || Object.keys(reasons).length === 0} className="w-full" onClick={submit}>
						Další krok
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
