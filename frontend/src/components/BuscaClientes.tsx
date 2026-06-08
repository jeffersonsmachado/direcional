import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { isAxiosError } from "axios";

type ClienteDto = { id: string; nome: string; cpf: string };

type PagedResponse<T> = {
	items: T[];
	totalCount: number;
	pageNumber: number;
	pageSize: number;
	totalPages: number;
	hasPreviousPage: boolean;
	hasNextPage: boolean;
};

interface Props {
	onClienteSelecionado: (clienteId: string) => void;
}

export default function ListaClientesSeletor({ onClienteSelecionado }: Props) {
	const [clientes, setClientes] = useState<ClienteDto[]>([]);
	const [infoPaginacao, setInfoPaginacao] = useState({
		paginaAtual: 1,
		totalPaginas: 1,
		totalRegistros: 0,
	});
	const [erro, setErro] = useState("");
	const [loading, setLoading] = useState(true);
	const [clienteSelecionadoId, setClienteSelecionadoId] = useState<
		string | null
	>(null);

	useEffect(() => {
		api
			.get<PagedResponse<ClienteDto>>(`/clientes?pageNumber=1&pageSize=5`)
			.then((res) => {
				setClientes(res.data.items);
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
				setLoading(false);
			});
	}, []);

	const selecionarCliente = (id: string) => {
		setClienteSelecionadoId(id);
		onClienteSelecionado(id); // Propagamos o ID para o componente pai
	};

	const carregarPagina = async (novaPagina: number) => {
		setLoading(true);
		setErro("");

		try {
			const res = await api.get<PagedResponse<ClienteDto>>(
				`/clientes?pageNumber=${novaPagina}&pageSize=5`,
			);

			setClientes(res.data.items);
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

	return (
		<div>
			<div>
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
			</div>

			<div
				style={{
					border: "1px solid #e2e8f0",
					padding: "16px",
					borderRadius: "8px",
				}}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
					{clientes.map((cliente) => (
						<div
							key={cliente.id}
							onClick={() => selecionarCliente(cliente.id)}
							style={{
								padding: "10px",
								cursor: "pointer",
								borderRadius: "4px",
								border:
									clienteSelecionadoId === cliente.id
										? "2px solid #3b82f6"
										: "1px solid #cbd5e1",
								backgroundColor:
									clienteSelecionadoId === cliente.id ? "#eff6ff" : "white",
							}}
						>
							<strong>{cliente.nome}</strong> - CPF: {cliente.cpf}
						</div>
					))}
				</div>

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
