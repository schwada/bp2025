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
		mutationFn: () => fetch(`${import.meta.env.VITE_API_URL}/api/request?email=${order.email}&orderNumber=${order.orderNumber}`, {
			method: "POST", body: JSON.stringify({ products: reasons })
		}).then(res => {
			if(!res.ok) throw new Error();
			return res.json();
		}),
		onSuccess: async (res) => {
			navigate("/pozadavek/" + res.id);
		},
		onError: (error) => {
			console.error(error);
		}
	});

	const [ reasons, setReasons ] = useState<Record<string, string>>({});
	const setProductReason = (productId: string, reason: string) => {
		if(reason === "-") {
			const newReasons = {...reasons};
			delete newReasons[productId];
			setReasons(newReasons);
		} else { 
			setReasons({...reasons, [productId]: reason});
		}
	}
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
										<p className="flex text-sm gap-2 font-medium">
											<span>{product.name}</span>
											<span className="text-muted-foreground">
												{product.quantity} ks
											</span>
										</p>
										<p className="text-sm text-muted-foreground">{product.price} Kč</p>
									</div>
								</div>
								<div className="flex gap-2 items-center">
									<Select defaultValue={"-"} onValueChange={(value) => setProductReason(product.id, value)}>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Vyberte důvod vrácení" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="too-big">Moc velke</SelectItem>
											<SelectItem value="too-small">Moc malé</SelectItem>
											<SelectItem value="other">Jiný</SelectItem>
											<SelectItem value="-">
												<span className="text-muted-foreground">Vyberte důvod</span>
											</SelectItem>
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
