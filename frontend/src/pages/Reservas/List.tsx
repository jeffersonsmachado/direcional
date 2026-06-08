import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";

type ReservaDto = {
	id: string;
	apartamentoId: string;
	clienteId: string;
	clienteNome: string;
	apartamentoNumero: string;
	bloco: string;
	dataReserva: string;
	status: string;
};

type PagedResponse<T> = {
	items: T[];
	totalCount: number;
	pageNumber: number;
	pageSize: number;
	totalPages: number;
	hasPreviousPage: boolean;
	hasNextPage: boolean;
};

export default function ReservasList() {
	const [reservas, setReservas] = useState<ReservaDto[]>([]);
	const [infoPaginacao, setInfoPaginacao] = useState({
		paginaAtual: 1,
		totalPaginas: 1,
		totalRegistros: 0,
	});
	const [loading, setLoading] = useState(true);
	const [erro, setErro] = useState("");

	useEffect(() => {
		api
			.get<PagedResponse<ReservaDto>>(`/reservas?pageNumber=1&pageSize=10`)
			.then((res) => {
				setReservas(res.data.items);
				setInfoPaginacao({
					paginaAtual: res.data.pageNumber,
					totalPaginas: res.data.totalPages,
					totalRegistros: res.data.totalCount,
				});
			})
			.catch((err) => {
				console.error(err);
				setErro("Falha ao carregar a lista de reservas.");
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	const carregarPagina = async (novaPagina: number) => {
		setLoading(true);
		setErro("");

		try {
			const res = await api.get<PagedResponse<ReservaDto>>(
				`/reservas?pageNumber=${novaPagina}&pageSize=10`,
			);

			setReservas(res.data.items);
			setInfoPaginacao({
				paginaAtual: res.data.pageNumber,
				totalPaginas: res.data.totalPages,
				totalRegistros: res.data.totalCount,
			});
		} catch (err: unknown) {
			if (isAxiosError<{ detail?: string }>(err)) {
				setErro(
					err.response?.data?.detail ??
						"Falha ao navegar para a página solicitada.",
				);
			} else {
				setErro("Falha ao navegar para a página solicitada.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handlePaginaAnterior = () => {
		if (infoPaginacao.paginaAtual > 1) {
			carregarPagina(infoPaginacao.paginaAtual - 1);
		}
	};

	const handlePaginaProxima = () => {
		if (infoPaginacao.paginaAtual < infoPaginacao.totalPaginas) {
			carregarPagina(infoPaginacao.paginaAtual + 1);
		}
	};

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

			{/* CONTROLES DE PAGINAÇÃO */}
			{!loading && infoPaginacao.totalPaginas > 0 && (
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						padding: "16px",
						borderTop: "1px solid #e2e8f0",
						background: "#f8fafc",
					}}
				>
					<span style={{ fontSize: "14px", color: "#64748b" }}>
						Mostrando página <strong>{infoPaginacao.paginaAtual}</strong> de{" "}
						<strong>{infoPaginacao.totalPaginas}</strong>
					</span>

					<div style={{ display: "flex", gap: "8px" }}>
						<button
							onClick={handlePaginaAnterior}
							disabled={infoPaginacao.paginaAtual === 1}
							style={{
								padding: "8px 16px",
								borderRadius: "4px",
								border: "1px solid #cbd5e1",
								background:
									infoPaginacao.paginaAtual === 1 ? "#f1f5f9" : "white",
								color: infoPaginacao.paginaAtual === 1 ? "#94a3b8" : "#334155",
								cursor:
									infoPaginacao.paginaAtual === 1 ? "not-allowed" : "pointer",
								fontWeight: "500",
							}}
						>
							Anterior
						</button>

						<button
							onClick={handlePaginaProxima}
							disabled={
								infoPaginacao.paginaAtual === infoPaginacao.totalPaginas
							}
							style={{
								padding: "8px 16px",
								borderRadius: "4px",
								border: "1px solid #cbd5e1",
								background:
									infoPaginacao.paginaAtual === infoPaginacao.totalPaginas
										? "#f1f5f9"
										: "white",
								color:
									infoPaginacao.paginaAtual === infoPaginacao.totalPaginas
										? "#94a3b8"
										: "#334155",
								cursor:
									infoPaginacao.paginaAtual === infoPaginacao.totalPaginas
										? "not-allowed"
										: "pointer",
								fontWeight: "500",
							}}
						>
							Próxima
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
