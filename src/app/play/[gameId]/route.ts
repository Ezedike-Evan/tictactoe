import { NextRequest, NextResponse } from "next/server";

import { URL_PATH } from "@/helpers/utils";

export const GET = async (
	req: NextRequest,
	context: { params: { gameId: string } }
) => {
	const prefix = "https://dial.to/?action=solana-action:";
	const { origin } = new URL(req.url);
	const { gameId } = context.params;
	const actionURL = new URL(
		`${prefix}${origin}${URL_PATH}/play/${gameId}&cluster=mainnet`
	);
	return NextResponse.redirect(actionURL);
};
