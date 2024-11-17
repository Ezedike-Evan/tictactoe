import { Game, Board } from "@/helpers/game";
const game1: Game = {};
{
	const id = "game1";
	const owner = "";
	const username = "Collins";
	const char = "x";
	const board: Board = {
		A1: "",
		A2: "",
		A3: "",
		B1: "",
		B2: "",
		B3: "",
		C1: "",
		C2: "",
		C3: "",
	};

	game1[id] = {
		_meta: {
			image_url:
				"https://hcti.io/v1/image/2eddb997-7a52-4b01-bff9-c6b8d870c5e8",
			owner: { address: owner, username, mark: char },
			state: ["ONGOING", null],
		},
		options: Object.keys(board),
		moves: [],
	};
}

const game2: Game = {};
{
	const id = "game2";
	const owner = "";
	const username = "NotCollins";
	const char = "o";
	const board: Board = {
		A1: "",
		A2: "x",
		A3: "",
		B1: "",
		B2: "x",
		B3: "",
		C1: "",
		C2: "o",
		C3: "",
	};

	game1[id] = {
		_meta: {
			image_url:
				"https://hcti.io/v1/image/2eddb997-7a52-4b01-bff9-c6b8d870c5e8",
			owner: { address: owner, username, mark: char },
			state: ["ONGOING", null],
		},
		options: Object.keys(board),
		moves: [
			{
				A1: "",
				A2: "x",
				A3: "",
				B1: "",
				B2: "",
				B3: "",
				C1: "",
				C2: "",
				C3: "",
			},
			{
				A1: "",
				A2: "x",
				A3: "",
				B1: "",
				B2: "",
				B3: "",
				C1: "",
				C2: "o",
				C3: "",
			},
			{
				A1: "",
				A2: "x",
				A3: "",
				B1: "",
				B2: "x",
				B3: "",
				C1: "",
				C2: "o",
				C3: "",
			},
		],
	};
}
export { game1, game2 };
