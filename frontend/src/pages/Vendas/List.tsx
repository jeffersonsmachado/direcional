import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { api } from "../../lib/api";
import { Link } from "react-router-dom";

type VendaDto = {
	id: string;
	clienteNome: string;
	apartamentoNumero: string;
	bloco: string;
	dataVenda: string;
	valorVenda: number;
	status: string | number; // Suporta strings ou os inteiros do Enum C#
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

export default function VendasList() {
	const [vendas, setVendas] = useState<VendaDto[]>([]);
	const [infoPaginacao, setInfoPaginacao] = useState({
		paginaAtual: 1,
		totalPaginas: 1,
		totalRegistros: 0,
	});
	const [loading, setLoading] = useState(true);
	const [erro, setErro] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		api
			.get<PagedResponse<VendaDto>>(`/vendas?pageNumber=1&pageSize=10`)
			.then((res) => {
				setVendas(res.data.items);
				setInfoPaginacao({
					paginaAtual: res.data.pageNumber,
					totalPaginas: res.data.totalPages,
					totalRegistros: res.data.totalCount,
				});
			})
			.catch((err) => {
				console.error(err);
				setErro("Falha ao carregar a lista de vendas.");
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	const carregarPagina = async (novaPagina: number) => {
		setLoading(true);
		setErro("");

		try {
			const res = await api.get<PagedResponse<VendaDto>>(
				`/vendas?pageNumber=${novaPagina}&pageSize=10`,
			);

			setVendas(res.data.items);
			setInfoPaginacao({
				paginaAtual: res.data.pageNumber,
				totalPaginas: res.data.totalPages,
				totalRegistros: res.data.totalCount,
			});
		} catch (err: unknown) {
			if (isAxiosError<{ detail?: string }>(err)) {
				setErro(
					err.response?.data.detail ??
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

	const obterLabelStatus = (status: string | number) => {
		if (status === 0 || status === "Pendente")
			return { label: "Pendente", bg: "#fef9c3", col: "#a16207" };
		if (status === 1 || status === "Concluida" || status === "Concluído")
			return { label: "Concluída", bg: "#dcfce7", col: "#15803d" };
		if (status === 2 || status === "Cancelada" || status === "Cancelado")
			return { label: "Cancelada", bg: "#fee2e2", col: "#b91c1c" };
		return { label: String(status), bg: "#e2e8f0", col: "#475569" };
	};

	if (loading)
		return (
			<p style={{ textAlign: "center", padding: "20px" }}>
				Carregando dados comerciais...
			</p>
		);

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
				<h2>Histórico de Vendas e Contratos</h2>
				<button
					onClick={() => navigate("/vendas/novo")}
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
					+ Registrar Venda
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
						<th style={{ padding: "12px" }}>Data do Fechamento</th>
						<th style={{ padding: "12px" }}>Cliente Comprador</th>
						<th style={{ padding: "12px" }}>Unidade (Bloco/Ap)</th>
						<th style={{ padding: "12px" }}>Valor Total</th>
						<th style={{ padding: "12px" }}>Status do Contrato</th>
						<th style={{ padding: "12px" }}>Ações</th>
					</tr>
				</thead>
				<tbody>
					{vendas.length === 0 ? (
						<tr>
							<td
								colSpan={5}
								style={{
									padding: "20px",
									textAlign: "center",
									color: "#64748b",
								}}
							>
								Nenhuma venda registrada no sistema.
							</td>
						</tr>
					) : (
						vendas.map((venda) => {
							const statusConfig = obterLabelStatus(venda.status);
							return (
								<tr
									key={venda.id}
									style={{ borderBottom: "1px solid #e2e8f0" }}
								>
									<td style={{ padding: "12px" }}>
										{new Date(venda.dataVenda).toLocaleDateString("pt-BR")}
									</td>
									<td style={{ padding: "12px", fontWeight: "500" }}>
										{venda.clienteNome}
									</td>
									<td style={{ padding: "12px" }}>
										Bl {venda.bloco} - Ap {venda.apartamentoNumero}
									</td>
									<td style={{ padding: "12px", fontWeight: "600" }}>
										{venda.valorVenda.toLocaleString("pt-BR", {
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
												backgroundColor: statusConfig.bg,
												color: statusConfig.col,
											}}
										>
											{statusConfig.label}
										</span>
									</td>
									<td style={{ padding: "12px" }}>
										{/* Link de navegação RESTful para o ID da venda */}
										<Link
											to={`/vendas/${venda.id}`}
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
							);
						})
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
