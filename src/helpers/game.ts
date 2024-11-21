import { v4 as uuidv4 } from "uuid";

import { getHTML, getCSS } from "./template";
import { createRedisClient } from "./utils";

const areEqual = (v1: string, v2: string, v3: string) => {
	return v1 == v2 && v1 == v3 && v2 == v3;
};

const BLANK_BOARD_IMAGE = "https://i.ibb.co/JdKGPQF/blank-board.png";
const WIN_IMAGE = "https://i.ibb.co/W5pvbgY/win-image.jpg";
const TIE_IMAGE = "https://i.ibb.co/S6xJTBT/tie-image.jpg";

export type Mark = "" | "x" | "o";

export type Board = {
	A1: Mark;
	A2: Mark;
	A3: Mark;
	B1: Mark;
	B2: Mark;
	B3: Mark;
	C1: Mark;
	C2: Mark;
	C3: Mark;
};

export type GameData = {
	_meta: {
		image_url: string;
		state: ["WIN" | "TIE" | "ONGOING", string | null]; // the second item is the winner if there is one
		owner: { address: string; username: string; mark: Mark };
		opponent?: { address: string; username: string; mark: Mark };
	};
	options: string[];
	moves: any[];
};

export type Game = Record<string, GameData>;

export const generateImage = async (gameData: Board): Promise<string> => {
	const json = {
		html: getHTML(gameData),
		css: getCSS(),
	};

	const options = {
		method: "POST",
		body: JSON.stringify(json),
		headers: {
			"Content-Type": "application/json",
			Authorization:
				"Basic " +
				btoa(process.env.HCTI_USER_ID + ":" + process.env.HCTI_API_KEY),
		},
	};

	const response = await fetch("https://hcti.io/v1/image", options);
	const data = await response.json();
	return data.url;
};

export const getOptions = (moves: any) => {
	Object.keys(moves).forEach((position) => moves[position] == "");
};

export const initializeNewGame = async (
	username: string,
	address: string,
	mark: Mark
): Promise<string> => {
	const RedisClient = await createRedisClient();
	await RedisClient.connect();

	const newGameId = uuidv4();
	const newBoard: Board = {
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
	const newGameData: GameData = {
		_meta: {
			image_url: BLANK_BOARD_IMAGE,
			owner: { address, username, mark },
			state: ["ONGOING", null],
		},
		options: Object.keys(newBoard),
		moves: [],
	};

	await RedisClient.set(newGameId, JSON.stringify(newGameData));
	await RedisClient.disconnect();

	return newGameId;
};

export const addOpponentData = async (
	gameId: string,
	username: string,
	address: string,
	mark: Mark
) => {
	const RedisClient = await createRedisClient();
	await RedisClient.connect();

	const data = await RedisClient.get(gameId);
	if (!data?.trim()) throw new Error("invalid game id");
	const game: GameData = JSON.parse(data);

	game._meta.opponent = { address, username, mark };

	await RedisClient.set(gameId, JSON.stringify(game));
	await RedisClient.disconnect();
};

export const updateGameMovesandOptions = async (
	gameId: string,
	move: string,
	char: string
): Promise<GameData> => {
	const RedisClient = await createRedisClient();
	await RedisClient.connect();

	const data = await RedisClient.get(gameId);
	if (!data?.trim()) throw new Error("invalid game id");
	const game: GameData = JSON.parse(data);

	if (game.moves.length == 0) {
		const newMove: any = {
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
		newMove[move] = char;
		game.moves.push(newMove);
		game.options = Object.keys(newMove).filter((key) => newMove[key] == "");
	} else {
		const lastMove = game.moves[game.moves.length - 1];
		lastMove[move] = char;
		game.moves.push(lastMove);
		game.options = Object.keys(lastMove).filter(
			(key) => lastMove[key] == ""
		);
	}
	await RedisClient.set(gameId, JSON.stringify(game));
	await RedisClient.disconnect();
	return game;
};

export const updateGameMetaData = async (gameId: string, winner?: string) => {
	const RedisClient = await createRedisClient();
	await RedisClient.connect();

	const data = await RedisClient.get(gameId);
	if (!data?.trim()) throw new Error("invalid game id");
	const game: GameData = JSON.parse(data);

	if (winner) {
		const winnerName =
			game._meta.owner.address == winner
				? game._meta.owner.username
				: game._meta.opponent!.username;
		game._meta.state = ["WIN", winnerName];
		game._meta.image_url = WIN_IMAGE;
		await RedisClient.set(gameId, JSON.stringify(game));
		return;
	}

	if (!game.options) {
		game._meta.image_url = TIE_IMAGE;
		game._meta.state = ["TIE", null];

		await RedisClient.set(gameId, JSON.stringify(game));
		return;
	}

	// game._meta.image_url = await generateImage(game.moves[game.moves.length - 1]);
	game._meta.image_url = `https://hcti.io/v1/image/2eddb997-7a52-4b01-bff9-c6b8d870c5e8`;

	await RedisClient.set(gameId, JSON.stringify(game));
	await RedisClient.disconnect();
};

export const fetchGameData = async (gameId: string): Promise<GameData> => {
	const RedisClient = await createRedisClient();
	await RedisClient.connect();

	const data = await RedisClient.get(gameId);
	if (!data?.trim()) throw new Error("invalid game id");
	const game: GameData = JSON.parse(data);

	await RedisClient.disconnect();
	return game;
};

export const checkIfUserCanPlay = async (
	gameId: string,
	player: string
): Promise<[boolean, string]> => {
	const gameData = await fetchGameData(gameId);

	if (gameData._meta.state[0] != "ONGOING") {
		return [false, "This game has ended"];
	}

	// Owner can only play when there's an odd number of moves
	// saved in the database since they are the second player.
	const isOwnersTurn = gameData.moves.length % 2 == 1;

	if (isOwnersTurn && player == gameData._meta.owner.address) {
		return [true, ""];
	} else if (
		!isOwnersTurn &&
		(!gameData._meta.opponent || player == gameData._meta.opponent!.address)
	) {
		return [true, ""];
	} else if (
		!(
			player == gameData._meta.owner.address ||
			player == gameData._meta.opponent!.address
		)
	) {
		return [false, "You are not a participant in this game"];
	}

	return [false, "It is not your turn to play"];
};

export const checkWin = async (gameId: string): Promise<boolean> => {
	const gameData = await fetchGameData(gameId);
	const lastMove = gameData.moves[gameData.moves.length - 1];

	if (lastMove.A1.trim() != "") {
		if (areEqual(lastMove.A1, lastMove.A2, lastMove.A3)) return true; // Using mobile keypad: 1 2 3
		if (areEqual(lastMove.A1, lastMove.B1, lastMove.C1)) return true; // Using mobile keypad: 1 4 7
		if (areEqual(lastMove.A1, lastMove.B2, lastMove.C3)) return true; // Using mobile keypad: 1 5 9
	}
	if (lastMove.A3.trim() != "") {
		if (areEqual(lastMove.A3, lastMove.B3, lastMove.C3)) return true; // Using mobile keypad: 3 6 9
		if (areEqual(lastMove.A3, lastMove.B2, lastMove.C1)) return true; // Using mobile keypad: 3 5 7
	}
	if (lastMove.A2.trim() != "") {
		if (areEqual(lastMove.A2, lastMove.B2, lastMove.C2)) return true; // Using mobile keypad: 2 5 8
	}
	if (lastMove.B1.trim() != "") {
		if (areEqual(lastMove.B1, lastMove.B2, lastMove.B3)) return true; // Using mobile keypad: 4 5 6
	}
	if (lastMove.C1.trim() != "") {
		if (areEqual(lastMove.C1, lastMove.C2, lastMove.C3)) return true; // Using mobile keypad: 7 8 9
	}
	return false;
};
