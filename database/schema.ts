import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export enum EventType {
	ISSUE_ENCOUNTERED = "ISSUE_ENCOUNTERED", 
	REJECTED = "REJECTED",
	WAITING_FOR_PACKAGE = "WAITING_FOR_PACKAGE",
	PACKAGE_RECEIVED = "PACKAGE_RECEIVED",
	WAITING_FOR_REFUND = "WAITING_FOR_REFUND",	
	RESOLVED = "RESOLVED",
}

export enum EventDescription {
	ISSUE_ENCOUNTERED = "Detail naleznete ve vašem emailu, případně nás prosím kontaktujte.",
	REJECTED = "Vaše žádost o vracení zboží byla odmítnuta.",
	WAITING_FOR_PACKAGE = "Vaše žádost o vracení zboží byla přijata.",
	PACKAGE_RECEIVED = "Zásilka byla přijata, posuzujeme Vaši žádost..",
	WAITING_FOR_REFUND = "Vracíme vám peníze.",	
	RESOLVED = "Vaše žádost o vracení zboží byla vyřízena.",
}

export enum EventTag {
	ISSUE_ENCOUNTERED = "Chybový stav",
	REJECTED = "Odmítnutý",
	WAITING_FOR_PACKAGE = "Čekáme na zásilku",
	PACKAGE_RECEIVED = "Zásilka přijata",
	WAITING_FOR_REFUND = "Refundace čeká",	
	RESOLVED = "Vyřízeno",
}

export enum EventTitle {
	ISSUE_ENCOUNTERED = "Nastala chyba při vyřizování vašeho požadavku.",
	REJECTED = "Zásilku vám zasíláme zpátky. V případě dalších dotazů nás můžete kontaktovat.",
	WAITING_FOR_PACKAGE = "Čekáme na zaslání nebo doručení zboží do naší pobočky.",
	PACKAGE_RECEIVED = "Budeme Vás informovat o posouzení žádosti.",
	WAITING_FOR_REFUND = "Váš požadavek byl posouzen. Peníze Vám budou vráceny.",	
	RESOLVED = "Vaše žádost o vracení zboží byla vyřízena, v případě dalších dotazů nás můžete kontaktovat.",
}


export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});
export type User = typeof usersTable.$inferSelect;
