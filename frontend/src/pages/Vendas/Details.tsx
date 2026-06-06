import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { api } from "../../lib/api";

type VendaDetalheDto = {
	id: string;
	apartamentoId: string;
	clienteId: string;
	clienteNome: string;
	clienteCpf: string;
	apartamentoNumero: string;
	bloco: string;
	andar: number;
	valorVenda: number;
	dataVenda: string;
	status: string | number; // 0 ou "Pendente", 1 ou "Concluida", 2 ou "Cancelada"
	cliente?: {
		id: string;
		nome: string;
		cpf: string;
	};
	apartamento?: {
		id: string;
		numero: string;
		bloco: string;
		andar: number;
		valor: number;
	};
};

export default function VendaDetalhes() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	// Estados primitivos e isolados de controle de infraestrutura
	const [venda, setVenda] = useState<VendaDetalheDto | null>(null);
	const [loading, setLoading] = useState(true);
	const [processando, setProcessando] = useState(false);
	const [erro, setErro] = useState("");

	// ÚNICO EFEITO: Executa estritamente uma vez quando o ID da URL muda
	useEffect(() => {
		if (!id) return;

		api
			.get<VendaDetalheDto>(`/vendas/${id}`)
			.then((res) => {
				setVenda(res.data);
			})
			.catch((err) => {
				console.error(err);
				setErro(
					"Não foi possível carregar as informações deste contrato de venda.",
				);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [id]);

	// Handler direto para disparar a Mutation (CancelarVendaCommand)
	const handleCancelarVenda = async () => {
		if (
			!window.confirm(
				"ATENÇÃO: Tem certeza que deseja CANCELAR esta venda? A unidade imobiliária voltará IMEDIATAMENTE ao status Disponível.",
			)
		) {
			return;
		}

		setErro("");
		setProcessando(true);

		try {
			await api.patch(`/vendas/${id}/cancelar`);

			// Atualiza o estado raiz de forma direta e atômica. Sem cascatas de efeitos.
			if (venda) {
				setVenda({
					...venda,
					status: typeof venda.status === "number" ? 2 : "Cancelada",
				});
			}
			alert("Contrato rescindido e apartamento liberado com sucesso!");
		} catch (err: unknown) {
			if (isAxiosError<{ message?: string }>(err)) {
				setErro(
					err.response?.data?.message ??
						"Erro ao processar o distrato no servidor.",
				);
			} else {
				setErro("Erro ao processar o distrato no servidor.");
			}
		} finally {
			setProcessando(false);
		}
	};

	if (loading)
		return (
			<p style={{ textAlign: "center", padding: "40px" }}>
				Carregando contrato de venda...
			</p>
		);
	if (erro && !venda)
		return (
			<div style={{ color: "red", padding: "20px" }}>
				{erro} <br />
				<Link to="/vendas">Voltar para Vendas</Link>
			</div>
		);
	if (!venda)
		return (
			<p style={{ textAlign: "center", padding: "40px" }}>
				Venda não encontrada.
			</p>
		);

	// 🚀 ESTADO DERIVADO (Calculado puramente em tempo de renderização, sem setState!)
	const obterConfigStatus = (status: string | number) => {
		if (status === 0 || status === "EmAndamento")
			return {
				label: "Pendente",
				col: "#a16207",
				bg: "#fef9c3",
				podeCancelar: true,
			};
		if (status === 1 || status === "Concluida" || status === "Concluído")
			return {
				label: "Concluída",
				col: "#15803d",
				bg: "#dcfce7",
				podeCancelar: true,
			}; // Ajuste se seu negócio permitir distrato de concluída
		if (status === 2 || status === "Cancelada" || status === "Cancelado")
			return {
				label: "Cancelada",
				col: "#b91c1c",
				bg: "#fee2e2",
				podeCancelar: false,
			};
		return {
			label: String(status),
			col: "#475569",
			bg: "#e2e8f0",
			podeCancelar: false,
		};
	};

	const statusConfig = obterConfigStatus(venda.status);

	return (
		<div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
			{/* Barra superior de controle */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "20px",
				}}
			>
				<button
					onClick={() => navigate("/vendas")}
					style={{
						padding: "8px 16px",
						cursor: "pointer",
						background: "#cbd5e1",
						border: "none",
						borderRadius: "4px",
					}}
				>
					← Voltar para Lista
				</button>
				<h2>Contrato de Compra e Venda</h2>
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

			<div
				style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
			>
				{/* Painel do Comprador */}
				<div
					style={{
						background: "white",
						padding: "24px",
						borderRadius: "8px",
						boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
					}}
				>
					<h3
						style={{
							color: "#1e293b",
							borderBottom: "2px solid #e2e8f0",
							paddingBottom: "10px",
							marginTop: 0,
						}}
					>
						Proponente / Cliente
					</h3>
					<p style={{ margin: "12px 0" }}>
						<strong>Nome:</strong> {venda?.cliente?.nome}
					</p>
					<p style={{ margin: "12px 0" }}>
						<strong>CPF:</strong> {venda?.cliente?.cpf}
					</p>
					<p style={{ margin: "12px 0" }}>
						<strong>Data da Assinatura:</strong>{" "}
						{new Date(venda.dataVenda).toLocaleDateString("pt-BR")}
					</p>
				</div>

				{/* Painel da Unidade Adquirida */}
				<div
					style={{
						background: "white",
						padding: "24px",
						borderRadius: "8px",
						boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
					}}
				>
					<h3
						style={{
							color: "#1e293b",
							borderBottom: "2px solid #e2e8f0",
							paddingBottom: "10px",
							marginTop: 0,
						}}
					>
						Ativo / Unidade
					</h3>
					<p style={{ margin: "12px 0" }}>
						<strong>Imóvel:</strong> Bloco {venda?.apartamento?.bloco} - Ap{" "}
						{venda?.apartamento?.numero}
					</p>
					<p style={{ margin: "12px 0" }}>
						<strong>Pavimento:</strong> {venda?.apartamento?.andar}º Andar
					</p>
					<p style={{ margin: "12px 0" }}>
						<strong>Valor de Contrato:</strong>{" "}
						<span
							style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a" }}
						>
							{venda.valorVenda.toLocaleString("pt-BR", {
								style: "currency",
								currency: "BRL",
							})}
						</span>
					</p>
				</div>
			</div>

			{/* Footer de Status e Mutação Lógica */}
			<div
				style={{
					background: "white",
					padding: "20px",
					borderRadius: "8px",
					boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
					marginTop: "20px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<div>
					<span style={{ marginRight: "10px", fontWeight: "500" }}>
						Situação Jurídica:
					</span>
					<span
						style={{
							color: statusConfig.col,
							backgroundColor: statusConfig.bg,
							padding: "6px 12px",
							borderRadius: "12px",
							fontSize: "14px",
							fontWeight: "bold",
						}}
					>
						{statusConfig.label}
					</span>
				</div>

				{statusConfig.podeCancelar && (
					<button
						onClick={handleCancelarVenda}
						disabled={processando}
						style={{
							padding: "10px 20px",
							background: "#ef4444",
							color: "white",
							border: "none",
							borderRadius: "4px",
							cursor: processando ? "not-allowed" : "pointer",
							fontWeight: "bold",
							opacity: processando ? 0.7 : 1,
						}}
					>
						{processando
							? "Processando Distrato..."
							: "Rescindir Contrato (Liberar Imóvel)"}
					</button>
				)}
			</div>
		</div>
	);
}
