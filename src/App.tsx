import logo from "./logo.svg";
import "./App.css";

import React, { FC, useMemo } from "react";
import Program from "./lib/Program";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
	LedgerWalletAdapter,
	PhantomWalletAdapter,
	SlopeWalletAdapter,
	SolflareWalletAdapter,
	SolletExtensionWalletAdapter,
	SolletWalletAdapter,
	TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

function App() {
	const network = WalletAdapterNetwork.Devnet;
	const endpoint = useMemo(() => clusterApiUrl(network), [network]);
	const wallets = useMemo(
		() => [
			new PhantomWalletAdapter(),
			new SlopeWalletAdapter(),
			new SolflareWalletAdapter({ network }),
			new TorusWalletAdapter(),
			new LedgerWalletAdapter(),
			new SolletWalletAdapter({ network }),
			new SolletExtensionWalletAdapter({ network }),
		],
		[network]
	);

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider wallets={wallets} autoConnect>
				<WalletModalProvider>
					<div className="App">
						<header className="App-header">
							<WalletMultiButton />
							<Program />
						</header>
					</div>
				</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	);
}

export default App;
