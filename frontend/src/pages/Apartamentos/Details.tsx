import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../lib/api";

type ApartamentoDetalheDto = {
	id: string;
	numero: string;
	bloco: string;
	andar: number;
	area: number;
	valor: number;
	status: string;
	// Se seu backend retornar histórico de reservas ou dados do cliente comprador, adicione aqui
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
			.catch((err) => {
				console.error(err);
				setErro("Não foi possível carregar os detalhes deste apartamento.");
			})
			.finally(() => setLoading(false));
	}, [id]);

	const getStatusStyle = (status: string) => {
		switch (status.toLowerCase()) {
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

	if (loading) return <p>Carregando informações do imóvel...</p>;
	if (erro)
		return (
			<div style={{ color: "red", padding: "20px" }}>
				{erro} <br />
				<Link to="/apartamentos">Voltar para a lista</Link>
			</div>
		);
	if (!apartamento) return <p>Apartamento não encontrado.</p>;

	return (
		<div style={{ maxWidth: "800px", margin: "0 auto" }}>
			{/* Cabeçalho com Link de Voltar */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "20px",
				}}
			>
				<button
					onClick={() => navigate(-1)}
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

			{/* Cartão de Detalhes Principal */}
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
					<p style={{ color: "#64748b", margin: "0 0 4px 0" }}>Área</p>
					<strong style={{ fontSize: "18px" }}>{apartamento.area} m²</strong>
				</div>
				<div>
					<p style={{ color: "#64748b", margin: "0 0 4px 0" }}>Preço</p>
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
							...getStatusStyle(apartamento.status),
						}}
					>
						{apartamento.status}
					</span>
				</div>
			</div>

			{/* Seção de Ações de Negócio dinâmicas baseado no Status */}
			<div
				style={{
					marginTop: "24px",
					background: "white",
					padding: "20px",
					borderRadius: "8px",
					boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
				}}
			>
				<h3>Ações de Vendas</h3>
				<div style={{ display: "flex", gap: "12px", marginTop: "15px" }}>
					{apartamento.status.toLowerCase() === "disponivel" && (
						<>
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
								Iniciar Venda
							</button>
						</>
					)}

					{apartamento.status.toLowerCase() === "reservado" && (
						<p style={{ color: "#64748b", fontStyle: "italic" }}>
							Este imóvel encontra-se reservado. Para efetivar, acesse a aba de{" "}
							<Link to="/reservas">Reservas</Link>.
						</p>
					)}

					{apartamento.status.toLowerCase() === "vendido" && (
						<p style={{ color: "#ef4444", fontWeight: "bold" }}>
							Unidade vendida. Contrato em andamento no módulo financeiro.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
