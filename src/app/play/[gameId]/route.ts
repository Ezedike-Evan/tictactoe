import { NextRequest, NextResponse } from "next/server";

import { URL_PATH } from "@/helpers/utils";

export const GET = async (
	req: NextRequest,
	context: { params: { uid: string } }
) => {
	const prefix = "https://dial.to/?action=solana-action:";
	const { origin } = new URL(req.url);
	const { uid } = context.params;
	const actionURL = new URL(
		`${prefix}${origin}${URL_PATH}/play/${uid}&cluster=devnet`
	);
	return NextResponse.redirect(actionURL);
};
