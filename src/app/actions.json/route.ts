import { NextRequest, NextResponse } from "next/server";
import { ActionsJson } from "@solana/actions";

import { HEADERS } from "@/helpers/utils";

export async function GET(req: NextRequest) {
	const payload: ActionsJson = {
		rules: [
			// map all root level routes to an action
			{
				pathPattern: "/new/**",
				apiPath: "/api/actions/new/**",
			},
			{
				pathPattern: "/new/confirm/*",
				apiPath: "/api/actions/new/confirm/*",
			},
			{
				pathPattern: "/play/**",
				apiPath: "/api/actions/play/**",
			},
			{
				pathPattern: "/play/*/confirm/*",
				apiPath: "/api/actions/play/*/confirm/*",
			},
			// idempotent rule as the fallback
			{
				pathPattern: "/api/actions/**",
				apiPath: "/api/actions/**",
			},
		],
	};
	return NextResponse.json(payload, { status: 200, headers: HEADERS });
}

export const OPTIONS = GET;
