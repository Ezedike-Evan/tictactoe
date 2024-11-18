import { createActionHeaders } from "@solana/actions";
import { clusterApiUrl } from "@solana/web3.js";
import { createClient } from "redis";

// CONSTANTS
export const MINT_FEE = 0.001;
export const PROCESSING_FEE = 0.0005;
export const URL_PATH = "/api/actions";
export const CLUSTER_URL = clusterApiUrl("mainnet-beta");
export const HEADERS = createActionHeaders({
	chainId: "mainnet",
	actionVersion: "2.2",
});

// FUNCTIONS
export const createRedisClient = async () => {
	const client = createClient({
		password: process.env.REDIS_PASSWORD,
		socket: {
			host: process.env.REDIS_HOST,
			port: Number(process.env.REDIS_PORT),
		},
	});
	client.on("error", (err: any) => console.log("Redis Client Error", err));
	return client;
};
