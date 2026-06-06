import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

type ClienteDto = {
	id: string;
	nome: string;
	cpf: string;
	email: string;
	telefone: string;
};

export default function ClientesList() {
	const [clientes, setClientes] = useState<ClienteDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [erro, setErro] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		api
			.get<ClienteDto[]>("/clientes")
			.then((res) => setClientes(res.data))
			.catch((err) => {
				console.error(err);
				setErro(
					"Falha ao carregar a lista de clientes. Certifique-se de estar autenticado.",
				);
			})
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <p>Carregando clientes...</p>;

	return (
		<div>
			{/* Cabeçalho Alinhado com Botão de Ação */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "20px",
				}}
			>
				<h2>Gerenciamento de Clientes</h2>
				<button
					onClick={() => navigate("/clientes/novo")}
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
					+ Novo Cliente
				</button>
			</div>

			{erro && (
				<p
					style={{
						color: "red",
						background: "#fee2e2",
						padding: "10px",
						borderRadius: "4px",
					}}
				>
					{erro}
				</p>
			)}

			{/* Tabela de Dados Hidratada */}
			<table
				style={{
					width: "100%",
					borderCollapse: "collapse",
					background: "white",
					borderRadius: "8px",
					overflow: "hidden",
					boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
				}}
			>
				<thead>
					<tr style={{ background: "#f1f5f9", textAlign: "left" }}>
						<th style={{ padding: "12px" }}>Nome</th>
						<th style={{ padding: "12px" }}>CPF</th>
						<th style={{ padding: "12px" }}>E-mail</th>
						<th style={{ padding: "12px" }}>Telefone</th>
					</tr>
				</thead>
				<tbody>
					{clientes.length === 0 ? (
						<tr>
							<td
								colSpan={4}
								style={{
									padding: "20px",
									textAlign: "center",
									color: "#64748b",
								}}
							>
								Nenhum cliente cadastrado até o momento.
							</td>
						</tr>
					) : (
						clientes.map((cliente) => (
							<tr
								key={cliente.id}
								style={{ borderBottom: "1px solid #e2e8f0" }}
							>
								<td style={{ padding: "12px", fontWeight: "500" }}>
									{cliente.nome}
								</td>
								<td style={{ padding: "12px" }}>{cliente.cpf}</td>
								<td style={{ padding: "12px" }}>{cliente.email}</td>
								<td style={{ padding: "12px" }}>{cliente.telefone}</td>
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	);
}
