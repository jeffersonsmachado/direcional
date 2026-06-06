import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { api } from "../../lib/api";
import "../../App.css";
import { NumericFormat } from "react-number-format";

export default function ApartamentosCreate() {
	const navigate = useNavigate();
	const [numero, setNumero] = useState("");
	const [bloco, setBloco] = useState("");
	const [andar, setAndar] = useState("");
	const [area, setArea] = useState("");
	const [valor, setValor] = useState("");
	const [salvando, setSalvando] = useState(false);
	const [erro, setErro] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErro("");
		setSalvando(true);

		// Mapeamento e conversão de tipos para satisfazer as propriedades numéricas do C#
		const payload = {
			numero,
			bloco,
			andar: parseInt(andar, 10),
			area: parseFloat(area),
			valor: parseFloat(valor),
		};

		if (isNaN(payload.andar) || isNaN(payload.area) || isNaN(payload.valor)) {
			setErro("Por favor, preencha os valores numéricos corretamente.");
			setSalvando(false);
			return;
		}

		try {
			// Envia o comando de criação para o endpoint do backend .NET
			await api.post("/apartamentos", payload);

			// Retorna para a listagem principal de apartamentos
			navigate("/apartamentos");
		} catch (err: unknown) {
			if (isAxiosError<{ message?: string }>(err)) {
				setErro(
					err.response?.data?.message ??
						"Erro ao cadastrar o apartamento. Verifique os dados.",
				);
			} else {
				setErro("Erro ao cadastrar o apartamento. Verifique os dados.");
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
			<h2 style={{ marginBottom: "20px" }}>Cadastrar Novo Apartamento</h2>

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
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "15px",
					}}
				>
					<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
						<label style={{ fontWeight: "500", color: "#334155" }}>
							Número da Unidade *
						</label>
						<input
							type="text"
							placeholder="Ex: 101"
							value={numero}
							onChange={(e) => setNumero(e.target.value)}
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
							Bloco / Torre *
						</label>
						<input
							type="text"
							placeholder="Ex: A"
							value={bloco}
							onChange={(e) => setBloco(e.target.value)}
							required
							style={{
								padding: "8px",
								borderRadius: "4px",
								border: "1px solid #cbd5e1",
							}}
						/>
					</div>
				</div>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "15px",
					}}
				>
					<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
						<label style={{ fontWeight: "500", color: "#334155" }}>
							Andar *
						</label>
						<input
							type="number"
							placeholder="Ex: 1"
							value={andar}
							onChange={(e) => setAndar(e.target.value)}
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
							Área Privativa (m²) *
						</label>
						<NumericFormat
							value={area}
							onValueChange={(values) => {
								setArea(values.value);
							}}
							thousandSeparator="."
							decimalSeparator=","
							decimalScale={2}
							fixedDecimalScale={true}
							allowNegative={false}
							placeholder="100,00"
							className="your-custom-input-styling"
							style={{
								padding: "8px",
								borderRadius: "4px",
								border: "1px solid #cbd5e1",
							}}
						/>
					</div>
				</div>

				<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
					<label style={{ fontWeight: "500", color: "#334155" }}>
						Valor de Venda (R$) *
					</label>
					<NumericFormat
						value={valor}
						onValueChange={(values) => {
							setValor(values.value);
						}}
						thousandSeparator="."
						decimalSeparator=","
						prefix={"R$ "}
						decimalScale={2}
						fixedDecimalScale={true}
						allowNegative={false}
						placeholder="R$ 0,00"
						className="your-custom-input-styling"
						style={{
							padding: "8px",
							borderRadius: "4px",
							border: "1px solid #cbd5e1",
						}}
					/>
				</div>

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
						onClick={() => navigate("/apartamentos")}
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
						{salvando ? "Cadastrando..." : "Confirmar Cadastro"}
					</button>
				</div>
			</form>
		</div>
	);
}
