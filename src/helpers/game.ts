import { getHTML, getCSS } from "./template";

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
	owner: string,
	username: string,
	char: Mark
) => {
	// TODO: Connect database
	// TODO: Create game data object
	const newGame: Game = {};
	// TODO: Generate new game id
	const id = "";
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

	newGame[id] = {
		_meta: {
			image_url: `https://hcti.io/v1/image/2eddb997-7a52-4b01-bff9-c6b8d870c5e8`, // new board image
			owner: { address: owner, username, mark: char },
			state: ["ONGOING", null],
		},
		options: Object.keys(newBoard),
		moves: [],
	};

	// TODO: Save game data
	// TODO: Disconnect database
	// TODO: Return game id
};

export const updateGameMovesandOptions = async (
	gameId: string,
	move: string,
	char: string
) => {
	// TODO: Connect database
	// TODO: Connect database
	// TODO: Fetch game data
	const gameData: any = {};
	const lastMove = gameData.moves[gameData.moves.length - 1];
	lastMove[move] = char;
	gameData.moves.push(lastMove);
	// TODO: Pop off last played move from the options array
	const options = Object.keys(lastMove).filter((key) => lastMove[key] == "");
	gameData.options = options;
	// TODO: Save game data
	// TODO: Disconnect database
	return gameData;
};

export const updateGameMetaData = async (gameId: string, winner?: string) => {
	// TODO: Connect database
	// TODO: Connect database
	// TODO: Fetch game data

	// Arbitrary gam
	const gameData: any = {};
	// const gameData: any = {};
	if (winner) {
		gameData._meta.state = ["W", winner];
		gameData._meta.image_url = `https://hcti.io/v1/image/2eddb997-7a52-4b01-bff9-c6b8d870c5e8`; // we have a winner image
		// TODO: Save game data
		return;
	}

	if (!gameData.options) {
		gameData._meta.image_url = `https://hcti.io/v1/image/2eddb997-7a52-4b01-bff9-c6b8d870c5e8`; // it's a tie image
		gameData._meta.state = ["T", null];
		// TODO: Save game data
		return;
	}

	// gameData._meta.image_url = await generateImage(
	// 	gameData.moves[gameData.moves.length - 1]
	// );
	gameData._meta.image_url = `https://hcti.io/v1/image/2eddb997-7a52-4b01-bff9-c6b8d870c5e8`;

	// TODO: Save game data
	// TODO: Disconnect database
};

export const fetchGameData = async (gameId: string): Promise<GameData> => {
	// TODO: Connect database
	// TODO: Connect database
	// TODO: Fetch game data by id

	// Arbitrary data
	const game: GameData = {
		_meta: {
			image_url: `https://hcti.io/v1/image/2eddb997-7a52-4b01-bff9-c6b8d870c5e8`,
			state: ["ONGOING", null],
			owner: { address: "WALLETowner", username: "USERNAME", mark: "x" },
		},
		options: ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"],
		moves: [],
	};

	// TODO: Disconnect database
	return game;
};

export const checkIfUserCanPlay = async (
	gameId: string,
	player: string
): Promise<[boolean, string]> => {
	const gameData = await fetchGameData(gameId);

	if (gameData._meta.state[0] != "ONGOING")
		return [false, "This game has ended"];

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
			player in
			[gameData._meta.owner.address, gameData._meta.opponent!.address]
		)
	) {
		return [false, "You are not a participant in this game"];
	}

	// TODO: Disconnect database
	// Return True or Error with message
	return [false, "It is not your turn to play"];
};

export const checkWin = async (gameId: string): Promise<boolean> => {
	const gameData = await fetchGameData(gameId);
	const lastMove: any = gameData.moves[gameData.moves.length - 1];

	if (lastMove.A1.trim() != "") {
		if ((lastMove.A1 == lastMove.A2) == lastMove.A3) return true; // Using mobile keypad: 1 2 3
		if ((lastMove.A1 == lastMove.B1) == lastMove.C1) return true; // Using mobile keypad: 1 4 7
		if ((lastMove.A1 == lastMove.B2) == lastMove.C3) return true; // Using mobile keypad: 1 5 9
	}
	if (lastMove.A3.trim() != "") {
		if ((lastMove.A3 == lastMove.B3) == lastMove.C3) return true; // Using mobile keypad: 3 6 9
		if ((lastMove.A3 == lastMove.B2) == lastMove.C1) return true; // Using mobile keypad: 3 5 7
	}
	if (lastMove.A2.trim() != "") {
		if ((lastMove.A2 == lastMove.B2) == lastMove.C2) return true; // Using mobile keypad: 2 5 8
	}
	if (lastMove.B1.trim() != "") {
		if ((lastMove.B1 == lastMove.B2) == lastMove.B3) return true; // Using mobile keypad: 4 5 6
	}
	if (lastMove.C1.trim() != "") {
		if ((lastMove.C1 == lastMove.C2) == lastMove.C3) return true; // Using mobile keypad: 7 8 9
	}
	return false;
};
