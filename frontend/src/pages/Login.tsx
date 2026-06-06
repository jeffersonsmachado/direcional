import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import axios from "axios";

export default function Login() {
	const [email, setEmail] = useState("");
	const [senha, setSenha] = useState("");
	const [erro, setErro] = useState("");
	const navigate = useNavigate();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setErro("");
		try {
			// Ajuste a interface de acordo com o que o seu backend retorna
			const response = await api.post<{ token: string; perfil: string }>(
				"/usuarios/auth/login",
				{ email, senha },
			);

			localStorage.setItem("direcional_token", response.data.token);
			// Salva o perfil do usuário (ex: "Admin", "Corretor", "Comum")
			localStorage.setItem(
				"direcional_perfil",
				response.data.perfil || "Comum",
			);

			navigate("/apartamentos");
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				setErro(
					err.response?.data?.message ||
						"Falha ao realizar login. Verifique as credenciais.",
				);
			} else {
				setErro("Ocorreu um erro inesperado.");
			}
		}
	};

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
			}}
		>
			<form
				onSubmit={handleLogin}
				style={{
					display: "flex",
					flexDirection: "column",
					width: "300px",
					gap: "10px",
					padding: "20px",
					border: "1px solid #ccc",
					borderRadius: "8px",
				}}
			>
				<h2>Direcional Login</h2>
				{erro && <p style={{ color: "red", fontSize: "14px" }}>{erro}</p>}
				<input
					type="email"
					placeholder="E-mail"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					style={{ padding: "8px" }}
				/>
				<input
					type="password"
					placeholder="Senha"
					value={senha}
					onChange={(e) => setSenha(e.target.value)}
					required
					style={{ padding: "8px" }}
				/>
				<button
					type="submit"
					style={{
						padding: "10px",
						cursor: "pointer",
						background: "#0056b3",
						color: "white",
						border: "none",
						borderRadius: "4px",
					}}
				>
					Entrar
				</button>
			</form>
		</div>
	);
}
