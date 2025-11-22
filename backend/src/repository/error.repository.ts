import type { ContentfulStatusCode } from "hono/utils/http-status";

export class DatabaseError extends Error {
	constructor(
		message: string,
		public code?: ContentfulStatusCode,
	) {
		super(message);
		this.name = "DatabaseError";
	}
}

export class InsufficientBalanceError extends DatabaseError {
	constructor(
		public accountId: string,
		public currentAmount: string,
		public requestedAmount: string,
	) {
		super(
			`Insufficient Balance in account ${accountId}. Current: ${currentAmount}, Requested ${requestedAmount} `,
		);
		this.name = "InsufficientBalanceError";
		this.code = 400;
	}
}

export class EntityNotFound extends DatabaseError {
	constructor(
		public entity: string,
		id: string,
	) {
		super(`${entity} with ID ${id} not found`);
		this.name = "EntityNotFound";
		this.code = 404;
	}
}

export class CurrencyMistmatchError extends DatabaseError {
	constructor(
		public fromCurrency: string,
		public toCurrency: string,
	) {
		super(
			`Currency mismatch: cannot transfer from ${fromCurrency} to ${toCurrency}`,
		);
		this.name = "CurrencyMistmatchError";
		this.code = 400;
	}
}

export class EntityAlreadyExists extends DatabaseError {
	constructor(
		public entityName: string,
		constraint: string,
	) {
		super(`${entityName} with this ${constraint} already exists`);
		this.code = 409;
	}
}
