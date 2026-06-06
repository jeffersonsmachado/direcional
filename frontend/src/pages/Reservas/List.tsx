import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Link } from "react-router-dom";

type ReservaDto = {
	id: string;
	apartamentoId: string;
	clienteId: string;
	clienteNome: string;
	apartamentoNumero: string;
	bloco: string;
	dataReserva: string;
	status: string; // Ex: Ativa, Cancelada, Efetivada
};

export default function ReservasList() {
	const [reservas, setReservas] = useState<ReservaDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [erro, setErro] = useState("");

	useEffect(() => {
		api
			.get<ReservaDto[]>("/reservas")
			.then((res) => setReservas(res.data))
			.catch((err) => {
				console.error(err);
				setErro("Falha ao carregar as reservas.");
			})
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <p>Carregando reservas...</p>;

	return (
		<div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "20px",
				}}
			>
				<h2>Gerenciamento de Reservas</h2>
			</div>

			{erro && (
				<p style={{ color: "red", background: "#fee2e2", padding: "10px" }}>
					{erro}
				</p>
			)}

			<table
				style={{
					width: "100%",
					borderCollapse: "collapse",
					background: "white",
					borderRadius: "8px",
					boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
				}}
			>
				<thead>
					<tr style={{ background: "#f1f5f9", textAlign: "left" }}>
						<th style={{ padding: "12px" }}>Data</th>
						<th style={{ padding: "12px" }}>Cliente</th>
						<th style={{ padding: "12px" }}>Imóvel (Bloco/Ap)</th>
						<th style={{ padding: "12px" }}>Status</th>
						<th style={{ padding: "12px" }}>Ações</th>
					</tr>
				</thead>
				<tbody>
					{reservas.length === 0 ? (
						<tr>
							<td colSpan={4} style={{ padding: "20px", textAlign: "center" }}>
								Nenhuma reserva encontrada.
							</td>
						</tr>
					) : (
						reservas.map((reserva) => (
							<tr
								key={reserva.id}
								style={{ borderBottom: "1px solid #e2e8f0" }}
							>
								<td style={{ padding: "12px" }}>
									{new Date(reserva.dataReserva).toLocaleDateString("pt-BR")}
								</td>
								<td style={{ padding: "12px" }}>{reserva.clienteNome}</td>
								<td style={{ padding: "12px" }}>
									Bl {reserva.bloco} - Ap {reserva.apartamentoNumero}
								</td>
								<td
									style={{
										padding: "12px",
										fontWeight: "bold",
										color: reserva.status === "Cancelada" ? "red" : "green",
									}}
								>
									{reserva.status}
								</td>
								<td style={{ padding: "12px" }}>
									<Link
										to={`/reservas/${reserva.id}`}
										style={{
											padding: "6px 12px",
											background: "#0056b3",
											color: "white",
											textDecoration: "none",
											borderRadius: "4px",
											fontSize: "14px",
										}}
									>
										Visualizar
									</Link>
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	);
}
