import {ColumnDef, ColumnFiltersState, SortingState, VisibilityState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable} from "@tanstack/react-table"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { EventTag, EventType} from "../../../../../database/schema";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { ChevronDown } from "lucide-react"
import { queryClient } from "../../main";
import { useState } from "react";

export type RequestRecord = {
	id: string;
	orderNumber: string;
	email: string;
	createdAt: Date;
	products: {id: number, name: string, desc: string, price: number}[];
	events: { date: Date, type: EventType }[];
};

export const columns: ColumnDef<RequestRecord>[] = [
	{ id: "id", header: "Identifikátor", cell: ({ row }) => row.original.id },
  	{ accessorKey: "orderNumber", header: "Cislo objednávky", cell: ({ row }) => row.getValue("orderNumber") },
  	{ accessorKey: "email", header: "Email", enableSorting: true, cell: ({ row }) => row.getValue("email") },
  	{ accessorKey: "createdAt", header: "Vytvořeno", enableSorting: true, cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleString("cs-CZ")},
  	{ accessorKey: "events", header: "Stav", enableSorting: true, cell: ({ row }) => {
		const lastEvent = row.original.events[row.original.events.length - 1];
		return (<div className="flex items-center gap-2">
			<div className="bg-gray-200 rounded-full px-2 py-1 text-xs">{EventTag[lastEvent.type]}</div>		
		</div>)
	}},
  { id: "actions", header: "Akce", enableHiding: false, cell: ({ row }) => (
	<div className="flex items-center gap-2">
		<Button variant="outline" size="sm">
			<Link to={`/dashboard/request/${row.original.id}`}>Detail</Link>
		</Button>
		<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="secondary" size="sm">
						Změna stavu <ChevronDown className="w-4 h-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{Object.values(EventType).map((eventType) => (
						<DropdownMenuItem className="cursor-pointer" key={eventType} onClick={() => {
							fetch(`${import.meta.env.VITE_API_URL}/api/requests/${row.original.id}/event`, {
								method: "POST", body: JSON.stringify({ eventType })
							}).then(res => res.json()).then(() => {
								queryClient.invalidateQueries({ queryKey: ["requests"] })
							})
						}}>
							{EventTag[eventType]}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
	</div>
  )},
]
 
export default function List() {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [rowSelection, setRowSelection] = useState({})
 
	const { data, isLoading, error } = useQuery({
		queryKey: ["requests"],
		queryFn: () => fetch(`${import.meta.env.VITE_API_URL}/api/requests`).then(res => res.json())
	})


	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: { sorting, columnFilters, columnVisibility, rowSelection }
	})
	
	if(isLoading) {
		return <div>Loading...</div>
	}

	if(error) {
		return <div>Error: {error.message}</div>
	}
	return (
		<div className="w-full max-w-screen-xl mx-auto">
	  		<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id}>
								{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
								</TableHead>
							))}
						</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
	  		</div>
	  		<div className="flex items-center justify-end space-x-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getRowModel().rows.length} of {table.getRowCount()}
				</div>
				<div className="space-x-2">
					<Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
						Previous
					</Button>
					<Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
						Next
					</Button>
				</div>
			</div>
		</div>
  	)
}