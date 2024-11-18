import { NextRequest, NextResponse } from "next/server";

import { URL_PATH } from "@/helpers/utils";

export const GET = async (req: NextRequest) => {
	const prefix = "https://dial.to/?action=solana-action:";
	const { origin } = new URL(req.url);
	const actionURL = new URL(
		`${prefix}${origin}${URL_PATH}/new&cluster=mainnet`
	);
	return NextResponse.redirect(actionURL);
};
