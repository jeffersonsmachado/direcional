import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

type UsuarioDto = {
	id: string;
	nome: string;
	email: string;
	ativo: boolean;
	perfilNome?: string; // Dependendo do seu DTO, pode vir a string direta ou o objeto aninhado
	perfil?: { nome: string };
};

export default function UsuariosList() {
	const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [erro, setErro] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		api
			.get<UsuarioDto[]>("/usuarios")
			.then((res) => setUsuarios(res.data))
			.catch((err) => {
				console.error(err);
				setErro(
					"Não foi possível carregar a lista de usuários. Verifique se você tem permissão de administrador.",
				);
			})
			.finally(() => setLoading(false));
	}, []);

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
							const perfil =
								usuario.perfilNome || usuario.perfil?.nome || "Padrão";

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
		</div>
	);
}
