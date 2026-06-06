import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { api } from "../../lib/api";
import { InputMask } from "@react-input/mask";
import "../../App.css";

export default function ClientesCreate() {
	const navigate = useNavigate();
	const [nome, setNome] = useState("");
	const [cpf, setCpf] = useState("");
	const [cpfMasked, setCpfMasked] = useState("");
	const [email, setEmail] = useState("");
	const [telefone, setTelefone] = useState("");
	const [telefoneMasked, setTelefoneMasked] = useState("");
	const [salvando, setSalvando] = useState(false);
	const [erro, setErro] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErro("");
		setSalvando(true);

		try {
			// Envia o comando de criação para o backend em .NET
			await api.post("/clientes", {
				nome,
				cpf,
				email,
				telefone,
			});

			// Retorna para a listagem atualizada após o sucesso
			navigate("/clientes");
		} catch (err: unknown) {
			if (isAxiosError<{ message?: string }>(err)) {
				setErro(
					err.response?.data?.message ??
						"Erro ao salvar cliente. Verifique os dados informados.",
				);
			} else {
				setErro("Erro ao salvar cliente. Verifique os dados informados.");
			}
		} finally {
			setSalvando(false);
		}
	};

	const handleTelefone = (e: React.ChangeEvent<HTMLInputElement>) => {
		const maskedValue = e.target.value;
		const unmaskedValue = maskedValue.replace(/\D/g, "");
		console.log(unmaskedValue);
		setTelefoneMasked(maskedValue);
		setTelefone(unmaskedValue);
	};

	const handleCpf = (e: React.ChangeEvent<HTMLInputElement>) => {
		const maskedValue = e.target.value;
		const unmaskedValue = maskedValue.replace(/\D/g, "");
		console.log(unmaskedValue);
		setCpfMasked(maskedValue);
		setCpf(unmaskedValue);
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
			<h2 style={{ marginBottom: "20px", color: "#4e4d4d" }}>
				Cadastrar Novo Cliente
			</h2>

			{erro && (
				<p
					style={{
						color: "red",
						background: "#fee2e2",
						padding: "10px",
						borderRadius: "4px",
						marginBottom: "15px",
					}}
				>
					{erro}
				</p>
			)}

			<form
				onSubmit={handleSubmit}
				style={{ display: "flex", flexDirection: "column", gap: "15px" }}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
					<label style={{ fontWeight: "500", color: "#334155" }}>
						Nome Completo *
					</label>
					<input
						type="text"
						value={nome}
						onChange={(e) => setNome(e.target.value)}
						required
						placeholder="Nome do Cliente"
						style={{
							padding: "8px",
							borderRadius: "4px",
							border: "1px solid #cbd5e1",
						}}
					/>
				</div>

				<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
					<label style={{ fontWeight: "500", color: "#334155" }}>CPF *</label>
					<InputMask
						id="cpf"
						value={cpfMasked}
						onChange={handleCpf}
						mask="___.___.___-__"
						replacement={{ _: /\d/ }}
						placeholder="000.000.000-00"
						style={{
							padding: "8px",
							borderRadius: "4px",
							border: "1px solid #cbd5e1",
						}}
					/>
				</div>

				<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
					<label style={{ fontWeight: "500", color: "#334155" }}>
						E-mail *
					</label>
					<input
						type="email"
						placeholder="exemplo@email.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						style={{
							padding: "8px",
							borderRadius: "4px",
							border: "1px solid #cbd5e1",
						}}
					/>
				</div>

				<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
					<label style={{ fontWeight: "500", color: "#334155" }}>
						Telefone de Contato
					</label>
					<InputMask
						id="phone"
						value={telefoneMasked}
						onChange={handleTelefone}
						mask="(__) ____-____"
						replacement={{ _: /\d/ }}
						placeholder="(00) 0000-0000"
						style={{
							padding: "8px",
							borderRadius: "4px",
							border: "1px solid #cbd5e1",
						}}
					/>
				</div>

				{/* Botões de Controle de Fluxo */}
				<div
					style={{
						display: "flex",
						gap: "10px",
						marginTop: "10px",
						justifyContent: "flex-end",
					}}
				>
					<button
						type="button"
						onClick={() => navigate("/clientes")}
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
						{salvando ? "Salvando..." : "Salvar Cliente"}
					</button>
				</div>
			</form>
		</div>
	);
}
