import { NextRequest, NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";
import {
	ActionError,
	CompletedAction,
	NextActionPostRequest,
} from "@solana/actions";

import { HEADERS, CLUSTER_URL } from "@/helpers/utils";
import { Mark, initializeNewGame, generateImage } from "@/helpers/game";

export const GET = async (req: NextRequest) => {
	return NextResponse.json(
		{ message: "Method not supported" } as ActionError,
		{ status: 403, headers: HEADERS }
	);
};

export const OPTIONS = async () => {
	return NextResponse.json(null, { status: 200, headers: HEADERS });
};

export const POST = async (
	req: NextRequest,
	context: { params: { username: string } }
) => {
	try {
		// Solana stuff
		const body: NextActionPostRequest = await req.json();

		const signature = body.signature as string;
		if (!signature.trim()) throw new Error("Invalid signature provided");

		const connection = new Connection(CLUSTER_URL);

		try {
			let status = await connection.getSignatureStatus(signature);
			if (!status) throw new Error("Unknown signature status");
			if (status.value?.confirmationStatus) {
				if (
					status.value.confirmationStatus != "confirmed" &&
					status.value.confirmationStatus != "finalized"
				) {
					throw new Error("Unable to confirm the transaction");
				}
			}
		} catch (err) {
			throw err;
		}

		// Game stuff
		const url = new URL(req.url);
		const owner = url.searchParams.get("payer");
		const username = url.searchParams.get("username");
		const char = url.searchParams.get("side") as string as Mark;
		if (!owner?.trim() || !username?.trim() || !char?.trim()) {
			throw new Error("Required fields are missing");
		}

		const gameId = await initializeNewGame(owner, username, char);

		const payload: CompletedAction = {
			type: "completed",
			title: "New game created successfully!",
			icon: `https://hcti.io/v1/image/2eddb997-7a52-4b01-bff9-c6b8d870c5e8`,
			label: "Created!",
			description: `Here is your game url:\n${url.origin}/play/${gameId}\n\nShare and challenge your friends to the ultimate tic tac toe battle.`,
		};

		return NextResponse.json(payload, { status: 201, headers: HEADERS });
	} catch (err: any) {
		console.log({ err });
		return NextResponse.json({ message: err.message } as ActionError, {
			status: 400,
			headers: HEADERS,
		});
	}
};
