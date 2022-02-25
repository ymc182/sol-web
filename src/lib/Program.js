import * as anchor from "@project-serum/anchor";
import idl from "../contract/dao.json";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import React, { useRef, useState } from "react";

export default function Program() {
	const { connection } = useConnection();
	const wallet = useWallet();
	const { publicKey } = useWallet();
	const [gameAddress, setGameAddress] = useState("");
	const [gameState, setGameState] = useState({});
	const newAddressRef = useRef(null);
	const joinRef = useRef(null);
	const [board, setBoard] = useState([[]]);

	const programId = new anchor.web3.PublicKey("A4FbE2SFRQ4Gw5BEYnNPvrzupMFPjhfwZqmXcBrCZg2Z");
	const provider = new anchor.Provider(connection, wallet, "processed");
	const program = new anchor.Program(idl, programId, provider);
	async function update() {
		const gameKeypair = localStorage.getItem("savedGame");
		const gameState = await program.account.game.fetch(new anchor.web3.PublicKey(gameKeypair));
		console.log(gameState.board);
		setGameAddress(gameKeypair);
		const currentState = "active" in gameState.state ? "Active" : "tie" in gameState.state ? "Tie" : "Won";
		const state = { state: currentState, turn: gameState.turn };
		setGameState(state);
		setBoard(gameState.board);
	}
	async function join() {
		const gameKeypair = localStorage.getItem("savedGame");
		let gameState = await program.account.game.fetch(new anchor.web3.PublicKey(joinRef.current.value));
		console.log(gameState.board);
		setGameAddress(gameKeypair);
		setBoard(gameState.board);
	}
	async function startNewGame() {
		const gameKeypair = anchor.web3.Keypair.generate();
		await program.rpc.setupGame(new anchor.web3.PublicKey(newAddressRef.current.value), {
			accounts: {
				game: gameKeypair.publicKey,
				playerOne: publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
			},
			signers: [gameKeypair],
		});
		localStorage.setItem("savedGame", gameKeypair.publicKey.toBase58());
		update();
	}
	async function play(idx) {
		const gameKeypair = localStorage.getItem("savedGame");
		await program.rpc.play(idx, {
			accounts: {
				player: publicKey,
				game: new anchor.web3.PublicKey(gameKeypair),
			},
			signers: [],
		});
		update();
	}
	const cellStyle = {
		backgroundColor: "#000",
		height: 75,
		width: 75,
		color: "white",
	};

	function Cell({ cell, idx }) {
		return (
			<button onClick={(e) => play(idx)} style={cellStyle}>
				{cell}
			</button>
		);
	}
	return (
		<div>
			<label htmlFor="address">Other Player Address:</label>
			<input ref={newAddressRef} type="text" id="address" name="fname" />
			<button onClick={startNewGame}>Start New</button>
			<p>OR</p>
			<label htmlFor="join">Game Address:</label>
			<input ref={joinRef} type="text" id="join" name="fname" />
			<button onClick={join}>Join</button>

			<p>Game Address: {gameAddress}</p>
			<button onClick={update}>Load Game / Refresh</button>
			<br />
			<div style={{ display: "flex", justifyContent: "center" }}>
				<div
					style={{
						width: "200px",
						// We set a background color to be revealed as the lines
						// of the board with the `grid-gap` property
						backgroundColor: "#000",
						display: "grid",
						// Our rows are equal to the length of our grid
						gridTemplateRows: `repeat(${board.length}, 1fr)`,
						// Our columns are equal to the length of a row
						gridTemplateColumns: `repeat(${board[0].length}, 1fr)`,
						gridGap: 2,
					}}
				>
					{board.map((row, rowIdx) =>
						row.map((cell, colIdx) => (
							<Cell
								key={`${colIdx}-${rowIdx}`}
								idx={{ row: rowIdx, column: colIdx }}
								cell={cell ? ("x" in cell ? "X" : "O") : "-"}
							/>
						))
					)}
				</div>
			</div>
			<p>
				{gameState.state} , Turn:{gameState.turn}
			</p>
		</div>
	);
}
