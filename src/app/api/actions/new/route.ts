import { NextRequest, NextResponse } from "next/server";
import {
	ActionError,
	ActionGetResponse,
	ActionPostRequest,
	ActionPostResponse,
	createPostResponse,
} from "@solana/actions";
import {
	Connection,
	LAMPORTS_PER_SOL,
	PublicKey,
	SystemProgram,
	TransactionMessage,
	VersionedTransaction,
} from "@solana/web3.js";

import { HEADERS, MINT_FEE, URL_PATH, CLUSTER_URL } from "@/helpers/utils";

const TO_PUBKEY = new PublicKey(process.env.PROGRAM_ACCOUNT!);

export async function GET(req: NextRequest) {
	const payload: ActionGetResponse = {
		title: "Ticky Tacky Toey",
		icon: "https://hcti.io/v1/image/2eddb997-7a52-4b01-bff9-c6b8d870c5e8", // TicTacToe logo
		description: "Battle of the Xs and Os.",
		label: "Choose side",
		links: {
			actions: [
				{
					type: "transaction",
					href: `${URL_PATH}/new?username={username}&side={side}`,
					label: "Choose side",
					parameters: [
						{
							type: "text",
							name: "username",
							label: "Enter your username",
							required: true,
						},
						{
							type: "radio",
							options: [
								{
									label: "Choose X",
									value: "x",
									selected: true,
								},
								{ label: "Choose O", value: "o" },
							],
							name: "side",
							label: "Pick a side",
							required: true,
						},
					],
				},
			],
		},
	};

	return NextResponse.json(payload, { status: 200, headers: HEADERS });
}

export async function POST(req: NextRequest) {
	try {
		const username = new URL(req.url).searchParams.get("username");
		if (!username?.trim()) throw new Error("Enter your username!");

		const side = new URL(req.url).searchParams.get("side");
		if (!side?.trim()) throw new Error("Pick a side!");

		const body: ActionPostRequest = await req.json();
		if (!body.account?.trim()) {
			throw new Error("`account` field is required");
		}

		let payer: PublicKey;
		try {
			payer = new PublicKey(body.account);
		} catch (err: any) {
			throw new Error("Invalid account provided: not a valid public key");
		}

		const connection = new Connection(CLUSTER_URL);
		const { blockhash } = await connection.getLatestBlockhash();

		const mintNewGame = SystemProgram.transfer({
			fromPubkey: payer,
			toPubkey: TO_PUBKEY,
			lamports: MINT_FEE * LAMPORTS_PER_SOL,
		});

		const message = new TransactionMessage({
			payerKey: payer,
			recentBlockhash: blockhash,
			instructions: [mintNewGame],
		}).compileToV0Message();

		const tx = new VersionedTransaction(message);

		const payload: ActionPostResponse = await createPostResponse({
			fields: {
				type: "transaction",
				transaction: tx,
				links: {
					next: {
						type: "post",
						href: `${URL_PATH}/new/confirm?payer=${payer}&username=${username}&side=${side}`,
					},
				},
			},
		});

		return NextResponse.json(payload, { status: 200, headers: HEADERS });
	} catch (err: any) {
		return NextResponse.json({ message: err.message } as ActionError, {
			status: 400,
			headers: HEADERS,
		});
	}
}

export const OPTIONS = GET;
