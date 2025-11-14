import type { Hono } from "hono";

export type Router = {
	path: string;
	handler: Hono;
};
