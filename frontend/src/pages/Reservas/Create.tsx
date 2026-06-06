import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { api } from "../../lib/api";

type ClienteDto = { id: string; nome: string; cpf: string };
type ApartamentoDto = {
	id: string;
	numero: string;
	bloco: string;
	andar: number;
	area: number;
	valor: number;
	status: string;
};

export default function ReservasCreate() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const apartamentoId = searchParams.get("apartamentoId") || "";

	const [clientes, setClientes] = useState<ClienteDto[]>([]);
	const [apartamento, setApartamento] = useState<ApartamentoDto | null>(null);
	const [clienteId, setClienteId] = useState("");
	const [observacoes, setObservacoes] = useState("");

	const [loading, setLoading] = useState(Boolean(apartamentoId));
	const [salvando, setSalvando] = useState(false);
	const [erro, setErro] = useState("");

	useEffect(() => {
		if (!apartamentoId) return;

		let cancelled = false;

		Promise.all([
			api.get<ClienteDto[]>("/clientes"),
			api.get<ApartamentoDto>(`/apartamentos/${apartamentoId}`),
		])
			.then(([resClientes, resApartamento]) => {
				if (cancelled) return;
				setClientes(resClientes.data);
				setApartamento(resApartamento.data);
			})
			.catch((err: unknown) => {
				if (cancelled) return;
				if (isAxiosError(err)) {
					setErro(err.response?.data?.message ?? "Erro ao carregar dados.");
				} else {
					setErro("Erro ao carregar dados.");
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [apartamentoId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!apartamentoId || !clienteId) {
			setErro("Por favor, selecione um cliente válido.");
			return;
		}

		setErro("");
		setSalvando(true);

		try {
			// Dispara o CriarReservaCommand para a Minimal API .NET
			await api.post("/reservas", {
				apartamentoId,
				clienteId,
				observacoes,
			});

			// Redireciona para o painel de reservas ativas
			navigate("/reservas");
		} catch (err: unknown) {
			if (isAxiosError<{ message?: string }>(err)) {
				setErro(
					err.response?.data?.message ??
						"Ocorreu um erro ao processar a reserva no servidor.",
				);
			} else {
				setErro("Ocorreu um erro ao processar a reserva no servidor.");
			}
		} finally {
			setSalvando(false);
		}
	};

	if (loading)
		return (
			<p style={{ textAlign: "center", padding: "20px" }}>
				Carregando dados da unidade e clientes...
			</p>
		);
	if (erro && !apartamento)
		return (
			<div style={{ color: "red", padding: "20px" }}>
				{erro} <br />
				<Link to="/apartamentos">Voltar para Imóveis</Link>
			</div>
		);

	return (
		<div
			style={{
				maxWidth: "700px",
				margin: "0 auto",
				display: "flex",
				flexDirection: "column",
				gap: "20px",
			}}
		>
			{/* 🌟 CABEÇALHO INFORMATIVO: Dados do Apartamento Carregados no Topo */}
			{apartamento && (
				<div
					style={{
						background: "#f8fafc",
						borderLeft: "6px solid #eab308",
						padding: "16px",
						borderRadius: "4px",
						boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
					}}
				>
					<h3 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>
						Unidade Escolhida
					</h3>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr 1fr",
							gap: "10px",
							fontSize: "14px",
							color: "#475569",
						}}
					>
						<div>
							<strong>Bloco:</strong> {apartamento.bloco}
						</div>
						<div>
							<strong>Apartamento:</strong> {apartamento.numero}
						</div>
						<div>
							<strong>Andar:</strong> {apartamento.andar}º
						</div>
						<div>
							<strong>Área:</strong> {apartamento.area} m²
						</div>
						<div style={{ gridColumn: "span 2" }}>
							<strong>Valor Tabela:</strong>{" "}
							{apartamento.valor.toLocaleString("pt-BR", {
								style: "currency",
								currency: "BRL",
							})}
						</div>
					</div>
				</div>
			)}

			{/* Formulário de Criação */}
			<div
				style={{
					background: "white",
					padding: "30px",
					borderRadius: "8px",
					boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
				}}
			>
				<h2 style={{ marginBottom: "20px", fontSize: "20px" }}>
					Vincular Cliente à Reserva
				</h2>

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
					style={{ display: "flex", flexDirection: "column", gap: "15px" }}
				>
					{/* Select de Clientes */}
					<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
						<label style={{ fontWeight: "500", color: "#334155" }}>
							Cliente Interessado *
						</label>
						<select
							value={clienteId}
							onChange={(e) => setClienteId(e.target.value)}
							required
							style={{
								padding: "10px",
								borderRadius: "4px",
								border: "1px solid #cbd5e1",
								background: "white",
							}}
						>
							<option value="">-- Selecione o Cliente Comprador --</option>
							{clientes.map((c) => (
								<option key={c.id} value={c.id}>
									{c.nome} (CPF: {c.cpf})
								</option>
							))}
						</select>
					</div>

					{/* Campo de Observações textuais */}
					<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
						<label style={{ fontWeight: "500", color: "#334155" }}>
							Condições Especiais / Observações
						</label>
						<textarea
							value={observacoes}
							onChange={(e) => setObservacoes(e.target.value)}
							rows={4}
							placeholder="Ex: Cliente solicita entrada facilitada ou uso de FGTS..."
							style={{
								padding: "10px",
								borderRadius: "4px",
								border: "1px solid #cbd5e1",
								fontFamily: "inherit",
							}}
						/>
					</div>

					{/* Ações do Formulário */}
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
							onClick={() => navigate(-1)}
							style={{
								padding: "10px 20px",
								background: "#e2e8f0",
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
								background: "#eab308",
								color: "white",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
								fontWeight: "bold",
							}}
						>
							{salvando ? "Salvando..." : "Confirmar e Bloquear Unidade"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
