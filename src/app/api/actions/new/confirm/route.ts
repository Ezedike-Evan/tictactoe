import { NextRequest, NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";
import {
	ActionError,
	CompletedAction,
	NextActionPostRequest,
} from "@solana/actions";

import { HEADERS, CLUSTER_URL } from "@/helpers/utils";
import { Mark, initializeNewGame } from "@/helpers/game";

export const GET = async (req: NextRequest) => {
	return NextResponse.json(
		{ message: "Method not supported" } as ActionError,
		{ status: 403, headers: HEADERS }
	);
};

export const OPTIONS = async () => {
	return NextResponse.json(null, { status: 200, headers: HEADERS });
};

export const POST = async (req: NextRequest) => {
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
		const username = url.searchParams.get("username");
		const address = url.searchParams.get("payer");
		const char = url.searchParams.get("side");
		if (!username?.trim() || !address?.trim() || !char?.trim()) {
			throw new Error(
				"Required fields are missing: address, username and char"
			);
		}

		const gameId = await initializeNewGame(username, address, char as Mark);

		const payload: CompletedAction = {
			type: "completed",
			title: "New game created successfully!",
			icon: "https://i.ibb.co/JdKGPQF/blank-board.png",
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
