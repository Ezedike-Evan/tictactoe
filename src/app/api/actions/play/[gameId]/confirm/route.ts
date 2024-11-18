import { NextRequest, NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";
import {
	ActionError,
	CompletedAction,
	NextActionPostRequest,
} from "@solana/actions";

import { CLUSTER_URL, HEADERS } from "@/helpers/utils";
import {
	checkWin,
	fetchGameData,
	updateGameMetaData,
	updateGameMovesandOptions,
} from "@/helpers/game";

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
	context: { params: { uid: string } }
) => {
	try {
		const body: NextActionPostRequest = await req.json();

		const signature = body.signature as string;
		if (!signature.trim()) throw new Error("invalid signature provided");

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

		const url = new URL(req.url);
		const gameId = context.params.uid;
		const move = url.searchParams.get("move");
		const char = url.searchParams.get("char");
		if (!move?.trim() || !char?.trim()) {
			throw new Error("Required fields are missing: move and char");
		}

		await updateGameMovesandOptions(gameId, move, char);
		const winner = (await checkWin(gameId)) ? body.account : undefined;
		await updateGameMetaData(gameId, winner);
		const game = await fetchGameData(gameId);

		let payload: CompletedAction;

		if (game._meta.state[0] == "ONGOING") {
			payload = {
				type: "completed",
				title: "Well Played!",
				icon: game._meta.image_url,
				label: "Done",
				description: `Let your opponent know that it's their turn to play.`,
			};
		} else {
			const description =
				game._meta.state[0] == "TIE"
					? "A tie. Good game!"
					: "You won! Congratulations!";

			payload = {
				type: "completed",
				title: "Game over!",
				icon: game._meta.image_url,
				label: "Done",
				description,
			};
		}

		// }

		return NextResponse.json(payload, { status: 201, headers: HEADERS });
	} catch (err: any) {
		return NextResponse.json({ message: err.message } as ActionError, {
			status: 400,
			headers: HEADERS,
		});
	}
};
