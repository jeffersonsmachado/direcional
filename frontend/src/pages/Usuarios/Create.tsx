import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { api } from "../../lib/api";
import "../../App.css";

type PerfilDto = {
	id: string;
	nome: string;
};

export default function UsuariosCreate() {
	const navigate = useNavigate();

	// Estados do Formulário
	const [nome, setNome] = useState("");
	const [email, setEmail] = useState("");
	const [senha, setSenha] = useState("");
	const [perfilId, setPerfilId] = useState("");

	// Estados de Infraestrutura e Dependências
	const [perfis, setPerfis] = useState<PerfilDto[]>([]);
	const [loadingPerfis, setLoadingPerfis] = useState(true);
	const [salvando, setSalvando] = useState(false);
	const [erro, setErro] = useState("");

	// Busca os perfis de acesso disponíveis assim que a tela abre
	useEffect(() => {
		api
			.get<PerfilDto[]>("/perfis") // Ajuste se o seu endpoint for /usuarios/perfis
			.then((res) => setPerfis(res.data))
			.catch((err) => {
				console.error(err);
				setErro("Aviso: Falha ao carregar a lista de Perfis de Acesso.");
			})
			.finally(() => setLoadingPerfis(false));
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!perfilId) {
			setErro("Por favor, selecione um perfil de acesso para este usuário.");
			return;
		}

		setErro("");
		setSalvando(true);

		try {
			// Dispara o CriarUsuarioCommand
			await api.post("/usuarios", {
				nome,
				email,
				senha, // A senha será criptografada (hash) pelo Backend antes de salvar no DB
				perfilId,
			});

			// Volta para a lista ao finalizar
			navigate("/usuarios");
		} catch (err: unknown) {
			if (isAxiosError<{ message?: string }>(err)) {
				setErro(
					err.response?.data?.message ??
						"Erro ao cadastrar usuário. O e-mail já pode estar em uso.",
				);
			} else {
				setErro("Erro ao cadastrar usuário. O e-mail já pode estar em uso.");
			}
		} finally {
			setSalvando(false);
		}
	};

	return (
		<div
			style={{
				maxWidth: "600px",
				margin: "0 auto",
				background: "white",
				padding: "30px",
				borderRadius: "8px",
				boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
			}}
		>
			<h2 style={{ marginBottom: "20px" }}>Cadastrar Operador</h2>

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

			<form
				onSubmit={handleSubmit}
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "15px",
					marginTop: "15px",
				}}
			>
				{/* Nome do Usuário */}
				<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
					<label style={{ fontWeight: "500" }}>Nome Completo *</label>
					<input
						type="text"
						value={nome}
						onChange={(e) => setNome(e.target.value)}
						required
						placeholder="Nome do Cliente"
						style={{
							padding: "10px",
							borderRadius: "4px",
							border: "1px solid #e1cbde",
						}}
					/>
				</div>

				{/* E-mail (Login) */}
				<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
					<label style={{ fontWeight: "500" }}>
						E-mail de Acesso (Login) *
					</label>
					<input
						type="email"
						placeholder="nome@direcional.com.br"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						style={{
							padding: "10px",
							borderRadius: "4px",
							border: "1px solid #e1cbde",
						}}
					/>
				</div>

				{/* Senha Provisória */}
				<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
					<label style={{ fontWeight: "500" }}>Senha Provisória *</label>
					<input
						type="password"
						value={senha}
						onChange={(e) => setSenha(e.target.value)}
						required
						minLength={6}
						placeholder=""
						style={{
							padding: "10px",
							borderRadius: "4px",
							border: "1px solid #e1cbde",
						}}
					/>
					<small style={{ color: "#64748b" }}>
						O usuário precisará alterar esta senha no primeiro login.
					</small>
				</div>

				{/* Seleção do Perfil de Acesso */}
				<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
					<label style={{ fontWeight: "500" }}>
						Nível de Permissão (Perfil) *
					</label>
					<select
						value={perfilId}
						onChange={(e) => setPerfilId(e.target.value)}
						required
						disabled={loadingPerfis}
						style={{
							padding: "10px",
							borderRadius: "4px",
							border: "1px solid #cbd5e1",
							background: loadingPerfis ? "#f1f5f9" : "white",
						}}
					>
						<option value="">
							{loadingPerfis
								? "Carregando perfis..."
								: "-- Selecione o Perfil --"}
						</option>
						{perfis.map((p) => (
							<option key={p.id} value={p.id}>
								{p.nome}
							</option>
						))}
					</select>
				</div>

				{/* Botões de Ação */}
				<div
					style={{
						display: "flex",
						gap: "10px",
						marginTop: "15px",
						justifyContent: "flex-end",
					}}
				>
					<button
						type="button"
						onClick={() => navigate("/usuarios")}
						style={{
							padding: "10px 20px",
							background: "red",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
						}}
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={salvando}
						style={{
							padding: "10px 20px",
							background: "#0056b3",
							color: "white",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
							fontWeight: "bold",
						}}
					>
						{salvando ? "Salvando..." : "Criar Usuário"}
					</button>
				</div>
			</form>
		</div>
	);
}
