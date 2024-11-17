import { createActionHeaders } from "@solana/actions";
import { clusterApiUrl } from "@solana/web3.js";
// import { v4 as uuidv4 } from "uuid";
// import { createClient } from "redis";

// const createRedisClient = async () => {
// 	const client = createClient({
// 		password: process.env.REDIS_PASSWORD,
// 		socket: {
// 			host: process.env.REDIS_HOST,
// 			port: Number(process.env.REDIS_PORT),
// 		},
// 	});
// 	client.on("error", (err: any) => console.log("Redis Client Error", err));
// 	return client;
// };

// CONSTANTS
export const MINT_FEE = 0.001;
export const PROCESSING_FEE = 0.0005;
export const URL_PATH = "/api/actions";
export const CLUSTER_URL = clusterApiUrl("mainnet-beta");
export const HEADERS = createActionHeaders({
	chainId: "devnet",
	actionVersion: "2.2",
});

// // FUNCTIONS
// export const saveNewGameData = async (
// 	username: string,
// 	truth1: string,
// 	truth2: string,
// 	lie: string
// ) => {
// 	const uid = uuidv4();
// 	const client = await createRedisClient();
// 	await client.connect();
// 	await client.hSet(uid, { username, truth1, truth2, lie });
// 	await client.disconnect();
// 	return uid;
// };

// export const fetchGameData = async (uid: string) => {
// 	const client = await createRedisClient();
// 	await client.connect();
// 	const { username, truth1, truth2, lie } = await client.hGetAll(uid);
// 	await client.disconnect();
// 	return { username, truth1, truth2, lie };
// };

// export const verifyAnswer = async (uid: string, answer: string) => {
// 	const { lie } = await fetchGameData(uid);
// 	return answer == lie;
// };
