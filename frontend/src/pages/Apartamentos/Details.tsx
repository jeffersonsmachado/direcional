import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

type ApartamentoDetalheDto = {
	id: string;
	numero: string;
	bloco: string;
	andar: number;
	area: number;
	valor: number;
	status: string | number; // 0: Disponivel, 1: Reservado, 2: Vendido
};

export default function ApartamentoDetalhes() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [apartamento, setApartamento] = useState<ApartamentoDetalheDto | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [erro, setErro] = useState("");

	useEffect(() => {
		if (!id) return;
		api
			.get<ApartamentoDetalheDto>(`/apartamentos/${id}`)
			.then((res) => setApartamento(res.data))
			.catch(() => setErro("Não foi possível carregar os detalhes do imóvel."))
			.finally(() => setLoading(false));
	}, [id]);

	// Função pura para resolver o Status
	const resolverStatus = (status: string | number) => {
		if (status === 0 || status === "Disponivel" || status === "Disponível")
			return "Disponível";
		if (status === 1 || status === "Reservado") return "Reservado";
		if (status === 2 || status === "Vendido") return "Vendido";
		return String(status);
	};

	const getStatusStyle = (statusLabel: string) => {
		switch (statusLabel) {
			case "Disponível":
				return { background: "#dcfce7", color: "#15803d" };
			case "Reservado":
				return { background: "#fef9c3", color: "#a16207" };
			case "Vendido":
				return { background: "#fee2e2", color: "#b91c1c" };
			default:
				return { background: "#e2e8f0", color: "#475569" };
		}
	};

	if (loading)
		return (
			<p style={{ textAlign: "center", padding: "40px" }}>
				Carregando dados da unidade...
			</p>
		);
	if (erro || !apartamento)
		return (
			<div style={{ color: "red", padding: "20px" }}>
				{erro || "Imóvel não encontrado"}
			</div>
		);

	const statusLabel = resolverStatus(apartamento.status);
	const isDisponivel = statusLabel === "Disponível";

	return (
		<div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "20px",
				}}
			>
				<button
					onClick={() => navigate("/apartamentos")}
					style={{
						padding: "8px 16px",
						cursor: "pointer",
						background: "#cbd5e1",
						border: "none",
						borderRadius: "4px",
					}}
				>
					← Voltar
				</button>
				<h2>
					Bloco {apartamento.bloco} - Apartamento {apartamento.numero}
				</h2>
			</div>

			<div
				style={{
					background: "white",
					padding: "24px",
					borderRadius: "8px",
					boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: "20px",
				}}
			>
				<div>
					<p style={{ color: "#64748b", margin: "0 0 4px 0" }}>Andar</p>
					<strong style={{ fontSize: "18px" }}>
						{apartamento.andar}º Andar
					</strong>
				</div>
				<div>
					<p style={{ color: "#64748b", margin: "0 0 4px 0" }}>
						Área Privativa
					</p>
					<strong style={{ fontSize: "18px" }}>
						{apartamento.area.toLocaleString("pt-BR")} m²
					</strong>
				</div>
				<div>
					<p style={{ color: "#64748b", margin: "0 0 4px 0" }}>
						Preço de Tabela
					</p>
					<strong style={{ fontSize: "22px", color: "#0f172a" }}>
						{apartamento.valor.toLocaleString("pt-BR", {
							style: "currency",
							currency: "BRL",
						})}
					</strong>
				</div>
				<div>
					<p style={{ color: "#64748b", margin: "0 0 4px 0" }}>Status Atual</p>
					<span
						style={{
							display: "inline-block",
							marginTop: "4px",
							padding: "6px 12px",
							borderRadius: "16px",
							fontSize: "14px",
							fontWeight: "bold",
							...getStatusStyle(statusLabel),
						}}
					>
						{statusLabel}
					</span>
				</div>
			</div>

			{/* BLOQUEIO DE AÇÕES BASEADO NO STATUS */}
			<div
				style={{
					marginTop: "24px",
					background: "white",
					padding: "24px",
					borderRadius: "8px",
					boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
				}}
			>
				<h3 style={{ marginTop: 0 }}>Ações Comerciais</h3>

				{isDisponivel ? (
					<div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
						<button
							onClick={() =>
								navigate(`/reservas/novo?apartamentoId=${apartamento.id}`)
							}
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
							Reservar Imóvel
						</button>
						<button
							onClick={() =>
								navigate(`/vendas/novo?apartamentoId=${apartamento.id}`)
							}
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
							Venda Direta
						</button>
					</div>
				) : (
					<div
						style={{
							marginTop: "15px",
							padding: "15px",
							background: "#f8fafc",
							borderLeft: "4px solid #94a3b8",
							borderRadius: "4px",
						}}
					>
						<p style={{ margin: 0, color: "#475569" }}>
							{statusLabel === "Reservado"
								? "Este imóvel encontra-se bloqueado por uma reserva ativa. Acompanhe na aba de Reservas."
								: "Este imóvel já foi vendido. A unidade não está mais disponível para negociação."}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
