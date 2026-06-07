import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { api } from "../../lib/api";

type UsuarioDto = {
	id: string;
	nome: string;
	email: string;
	ativo: boolean;
	perfilNome?: string; // Dependendo do seu DTO, pode vir a string direta ou o objeto aninhado
	perfil?: string;
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

export default function UsuariosList() {
	const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
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
			.get<PagedResponse<UsuarioDto>>(`/usuarios?pageNumber=1&pageSize=3`)
			.then((res) => {
				setUsuarios(res.data.items);
				setInfoPaginacao({
					paginaAtual: res.data.pageNumber,
					totalPaginas: res.data.totalPages,
					totalRegistros: res.data.totalCount,
				});
			})
			.catch((err) => {
				console.error(err);
				setErro("Falha ao carregar a lista de usuários.");
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	const carregarPagina = async (novaPagina: number) => {
		setLoading(true);
		setErro("");

		try {
			const res = await api.get<PagedResponse<UsuarioDto>>(
				`/usuarios?pageNumber=${novaPagina}&pageSize=3`,
			);

			setUsuarios(res.data.items);
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

	if (loading)
		return (
			<p style={{ textAlign: "center", padding: "20px" }}>
				A carregar operadores do sistema...
			</p>
		);

	return (
		<div>
			{/* Cabeçalho */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "20px",
				}}
			>
				<h2>Gerenciamento de Usuários</h2>
				<button
					onClick={() => navigate("/usuarios/novo")}
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
					+ Novo Usuário
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

			{/* Tabela de Usuários */}
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
						<th style={{ padding: "12px" }}>E-mail (Login)</th>
						<th style={{ padding: "12px" }}>Perfil de Acesso</th>
						{/* <th style={{ padding: "12px" }}>Status</th> */}
					</tr>
				</thead>
				<tbody>
					{usuarios.length === 0 ? (
						<tr>
							<td
								colSpan={4}
								style={{
									padding: "20px",
									textAlign: "center",
									color: "#64748b",
								}}
							>
								Nenhum usuário cadastrado no sistema.
							</td>
						</tr>
					) : (
						usuarios.map((usuario) => {
							// Resolução segura do nome do perfil, suportando DTO plano ou aninhado do EF Core
							const perfil = usuario.perfilNome || usuario.perfil || "Padrão";

							return (
								<tr
									key={usuario.id}
									style={{ borderBottom: "1px solid #e2e8f0" }}
								>
									<td style={{ padding: "12px", fontWeight: "500" }}>
										{usuario.nome}
									</td>
									<td style={{ padding: "12px", color: "#0369a1" }}>
										{usuario.email}
									</td>
									<td style={{ padding: "12px" }}>{perfil}</td>
									{/* <td style={{ padding: "12px" }}>
										<span
											style={{
												padding: "4px 8px",
												borderRadius: "12px",
												fontSize: "12px",
												fontWeight: "bold",
												backgroundColor: usuario.ativo ? "#dcfce7" : "#fee2e2",
												color: usuario.ativo ? "#15803d" : "#b91c1c",
											}}
										>
											{usuario.ativo ? "Ativo" : "Bloqueado"}
										</span>
									</td> */}
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
