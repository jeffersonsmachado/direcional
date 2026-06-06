import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

type ApartamentoDto = {
	id: string;
	numero: string;
	bloco: string;
	andar: number;
	area: number;
	valor: number;
	status: string;
};

export default function Apartamentos() {
	const [apartamentos, setApartamentos] = useState<ApartamentoDto[]>([]);
	const [loading, setLoading] = useState(true);

	const navigate = useNavigate();

	const perfilUsuario = localStorage.getItem("direcional_perfil") || "Comum";
	const isFuncionario =
		perfilUsuario === "Admin" || perfilUsuario === "Corretor";

	useEffect(() => {
		api
			.get<ApartamentoDto[]>("/apartamentos")
			.then((res) => setApartamentos(res.data))
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	const getStatusStyle = (status: string) => {
		switch (status.toLowerCase()) {
			case "disponivel":
				return { background: "#dcfce7", color: "#15803d" };
			case "reservado":
				return { background: "#fef9c3", color: "#a16207" };
			case "vendido":
				return { background: "#fee2e2", color: "#b91c1c" };
			default:
				return { background: "#e2e8f0", color: "#475569" };
		}
	};

	if (loading) return <p>Carregando apartamentos...</p>;

	return (
		<div>
			<h2>Listagem de Apartamentos</h2>
			{isFuncionario && (
				<button
					onClick={() => navigate("/apartamentos/novo")}
					style={{
						padding: "10px 20px",
						background: "#22c55e",
						color: "white",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
						fontWeight: "bold",
					}}
				>
					+ Novo Apartamento
				</button>
			)}
			<table
				style={{
					width: "100%",
					borderCollapse: "collapse",
					marginTop: "20px",
					background: "white",
					borderRadius: "8px",
					overflow: "hidden",
					boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
				}}
			>
				<thead>
					<tr style={{ background: "#f1f5f9", textAlign: "left" }}>
						<th style={{ padding: "12px" }}>Bloco / Número</th>
						<th style={{ padding: "12px" }}>Andar</th>
						<th style={{ padding: "12px" }}>Área (m²)</th>
						<th style={{ padding: "12px" }}>Valor</th>
						<th style={{ padding: "12px" }}>Status</th>
						<th style={{ padding: "12px" }}>Ações</th>
					</tr>
				</thead>
				<tbody>
					{apartamentos.map((ap) => (
						<tr key={ap.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px" }}>
								Bloco {ap.bloco} - Ap {ap.numero}
							</td>
							<td style={{ padding: "12px" }}>{ap.andar}º</td>
							<td style={{ padding: "12px" }}>
								{ap.area.toLocaleString("pt-BR")} m²
							</td>
							<td style={{ padding: "12px" }}>
								{ap.valor.toLocaleString("pt-BR", {
									style: "currency",
									currency: "BRL",
								})}
							</td>
							<td style={{ padding: "12px" }}>
								<span
									style={{
										padding: "4px 8px",
										borderRadius: "12px",
										fontSize: "12px",
										fontWeight: "bold",
										...getStatusStyle(ap.status),
									}}
								>
									{ap.status}
								</span>
							</td>
							<td style={{ padding: "12px" }}>
								{/* ← Botão que leva para a rota dinâmica */}
								<Link
									to={`/apartamentos/${ap.id}`}
									style={{
										padding: "6px 12px",
										background: "#0056b3",
										color: "white",
										textDecoration: "none",
										borderRadius: "4px",
										fontSize: "14px",
									}}
								>
									Detalhes
								</Link>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
