import { useEffect, useState } from "react";
import { api } from "./lib/api";

type ApartamentoDto = {
	id: string;
	numero: string;
	bloco: string;
	andar: number;
	area: number;
	valor: number;
	status: string;
};

export default function App() {
	const [data, setData] = useState<ApartamentoDto[]>([]);

	useEffect(() => {
		api
			.get<ApartamentoDto[]>("/apartamentos")
			.then((res) => setData(res.data))
			.catch(console.error);
	}, []);

	return (
		<main>
			<h1>Direcional Frontend</h1>
			<pre>{JSON.stringify(data, null, 2)}</pre>
		</main>
	);
}
