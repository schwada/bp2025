import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { EventType, EventTitle, EventDescription } from "../../../../../database/schema";

export default function Pozadavek({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
	
	const { id } = useParams();
	const { data, isLoading, error } = useQuery({
		retry: 2, throwOnError: false,
		queryKey: ["request", id],
		queryFn: () => fetch(`${import.meta.env.VITE_API_URL}/api/request/${id}`).then(res => {
			if (!res.ok) throw new Error();
			return res.json();
		}),
	});

	if (isLoading || error) return (	
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-xl">
				<div className={cn("flex relative", className)} {...props}>
					<Card className="flex-2 rounded-tr-none rounded-br-none">
						<CardHeader>
							<CardTitle className="text-2xl">Stav požadavku</CardTitle>
							{(error) ? (
								<CardDescription>Pro objednávku s číslem <span className="font-bold">#{id}</span> nebyl nalezen žádný požadavek.</CardDescription>
							) : (
								<CardDescription>Pro objednávku s číslem <span className="font-bold">#{id}</span> se načítá...</CardDescription>
							)}
						</CardHeader>
					</Card>
				</div>
			</div>
		</div>
	);

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-4xl">
				<div className={cn("flex relative", className)} {...props}>
					<Card className="flex-2 rounded-tr-none rounded-br-none">
						<CardHeader>
							<CardTitle className="text-2xl">Stav požadavku</CardTitle>
							<CardDescription>Pro objednávku s číslem <span className="font-bold">#{id}</span> je Vaše žádost o vracení zboží přijata.</CardDescription>
						</CardHeader>
						<CardContent>	

						<hr className="mb-4" />
						<div className="flex flex-wrap">
							{data.products.map((product: any) => (
								<div key={product.id} className="flex flex-col gap-2 w-full md:w-1/2 lg:w-1/3 p-1">
									<div className="flex items-center gap-2 rounded-md border p-4">
										<div className="h-12 w-12 rounded-md bg-gray-200" />
									<div className="flex flex-col">
											<p className="text-sm font-medium">{product.name}</p>
											<p className="text-sm text-muted-foreground">{product.price} Kč</p>
										</div>
									</div>
								</div>
							))}
						</div>

						<hr className="my-4" />
						
						<div className="flex flex-col gap-4">
							{data.events.map((event: any, index: number) => (
								<div key={index} className="grid grid-cols-[25px_1fr] items-start">
									<span className={`flex h-2 w-2 translate-y-1 rounded-full ${event.type === EventType.ISSUE_ENCOUNTERED ? "bg-red-500" : "bg-sky-500"}`} />
									<div className="space-y-1">
										<p className="text-sm font-medium leading-none">
											{EventTitle[event.type as keyof typeof EventTitle]}
										</p>
										<p className="text-sm text-muted-foreground">
											<span className="text-muted-foreground pr-2">
												{new Date(event.date).toLocaleString("cs-CZ", { timeZone: "Europe/Prague" })}
											</span> 
											{EventDescription[event.type as keyof typeof EventDescription]}
										</p>
									</div>
								</div>
							))}
						</div>
						</CardContent>
					</Card>
					<div className="flex-1 top-0 bg-muted rounded-tr-lg rounded-br-lg flex items-center justify-center">
						<p className="text-sm text-muted-foreground">Štítek k zásilce</p>
					</div>
				</div>
			</div>
		</div>
	);
}