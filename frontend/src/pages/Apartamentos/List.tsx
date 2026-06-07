import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { api } from "../../lib/api";

type ApartamentoDto = {
	id: string;
	numero: string;
	bloco: string;
	andar: number;
	area: number;
	valor: number;
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

export default function ApartamentosList() {
	const navigate = useNavigate();

	const [apartamentos, setApartamentos] = useState<ApartamentoDto[]>([]);
	const [infoPaginacao, setInfoPaginacao] = useState({
		paginaAtual: 1,
		totalPaginas: 1,
		totalRegistros: 0,
	});

	// O estado loading já nasce como TRUE, eliminando a necessidade de setá-lo no useEffect
	const [loading, setLoading] = useState(true);
	const [erro, setErro] = useState("");

	const perfilUsuario = localStorage.getItem("direcional_perfil") || "Comum";
	const isFuncionario =
		perfilUsuario === "Admin" || perfilUsuario === "Corretor";

	// 1. EFEITO DE MONTAGEM INICIAL (Executa apenas uma vez)
	useEffect(() => {
		// A chamada é feita, e todos os setStates ocorrem de forma ASSÍNCRONA na resolução da Promise.
		api
			.get<PagedResponse<ApartamentoDto>>(
				`/apartamentos?pageNumber=1&pageSize=3`,
			)
			.then((res) => {
				setApartamentos(res.data.items);
				setInfoPaginacao({
					paginaAtual: res.data.pageNumber,
					totalPaginas: res.data.totalPages,
					totalRegistros: res.data.totalCount,
				});
			})
			.catch((err) => {
				console.error(err);
				setErro("Falha ao carregar a lista de apartamentos.");
			})
			.finally(() => {
				setLoading(false); // Assíncrono: Seguro!
			});
	}, []); // Array vazio: Sem dependências reativas que causem loops.

	// 2. FUNÇÃO DE PAGINAÇÃO (Disparada EXCLUSIVAMENTE por eventos do usuário)
	const carregarPagina = async (novaPagina: number) => {
		// Como isto é invocado por um onClick, setStates síncronos são o padrão correto do React.
		setLoading(true);
		setErro("");

		try {
			const res = await api.get<PagedResponse<ApartamentoDto>>(
				`/apartamentos?pageNumber=${novaPagina}&pageSize=3`,
			);

			setApartamentos(res.data.items);
			setInfoPaginacao({
				paginaAtual: res.data.pageNumber,
				totalPaginas: res.data.totalPages,
				totalRegistros: res.data.totalCount,
			});
		} catch (err: unknown) {
			if (isAxiosError<{ message?: string }>(err)) {
				setErro(
					err.response?.data?.message ??
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

	const getStatusStyle = (status: string) => {
		switch (status.toLowerCase()) {
			case "disponível":
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
				<h2>
					Listagem de Apartamentos ({infoPaginacao.totalRegistros} no total)
				</h2>

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

			<div
				style={{
					overflowX: "auto",
					background: "white",
					borderRadius: "8px",
					boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
				}}
			>
				<table style={{ width: "100%", borderCollapse: "collapse" }}>
					<thead>
						<tr style={{ background: "#f1f5f9", textAlign: "left" }}>
							<th style={{ padding: "16px 12px" }}>Bloco / Número</th>
							<th style={{ padding: "16px 12px" }}>Andar</th>
							<th style={{ padding: "16px 12px" }}>Área (m²)</th>
							<th style={{ padding: "16px 12px" }}>Valor de Tabela</th>
							<th style={{ padding: "16px 12px" }}>Status</th>
							<th style={{ padding: "16px 12px", textAlign: "center" }}>
								Ações
							</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td
									colSpan={6}
									style={{ padding: "20px", textAlign: "center" }}
								>
									Carregando unidades...
								</td>
							</tr>
						) : apartamentos.length === 0 ? (
							<tr>
								<td
									colSpan={6}
									style={{ padding: "20px", textAlign: "center" }}
								>
									Nenhum apartamento encontrado.
								</td>
							</tr>
						) : (
							apartamentos?.map((ap) => (
								<tr key={ap.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
									<td style={{ padding: "12px", fontWeight: "500" }}>
										Bloco {ap.bloco} - Ap {ap.numero}
									</td>
									<td style={{ padding: "12px" }}>{ap.andar}º</td>
									<td style={{ padding: "12px" }}>{ap.area} m²</td>
									<td style={{ padding: "12px", fontWeight: "500" }}>
										{ap.valor.toLocaleString("pt-BR", {
											style: "currency",
											currency: "BRL",
										})}
									</td>
									<td style={{ padding: "12px" }}>
										<span
											style={{
												padding: "6px 10px",
												borderRadius: "12px",
												fontSize: "12px",
												fontWeight: "bold",
												...getStatusStyle(ap.status),
											}}
										>
											{ap.status}
										</span>
									</td>
									<td style={{ padding: "12px", textAlign: "center" }}>
										<Link
											to={`/apartamentos/${ap.id}`}
											style={{
												padding: "6px 12px",
												background: "#0ea5e9",
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
									color:
										infoPaginacao.paginaAtual === 1 ? "#94a3b8" : "#334155",
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
		</div>
	);
}
