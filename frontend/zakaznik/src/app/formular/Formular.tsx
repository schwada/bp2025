import { useState } from "react";
import ProductsForm from "./ProductsForm";
import TicketForm from "./TicketForm";

export enum Step { Ticket = 1, Products = 2 }

export default function Formular() {

	const [ step, setStep ] = useState(Step.Ticket);
	const [ order, setOrder ] = useState(null);

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-lg">
				{step === Step.Ticket && <TicketForm setOrder={setOrder} setStep={setStep}/>}
				{step === Step.Products && <ProductsForm order={order}/>}
			</div>
		</div>
	)
}