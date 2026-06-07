import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { api } from "../../lib/api";

type ReservaDetalheDto = {
	id: string;
	apartamentoId: string;
	clienteId: string;
	clienteNome: string;
	clienteCpf: string;
	apartamentoNumero: string;
	bloco: string;
	andar: number;
	valorApartamento: number;
	dataReserva: string;
	status: string | number; // 0 ou "Ativa", 1 ou "Efetivada", 2 ou "Cancelada"
	observacoes?: string;
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

export default function ReservaDetalhes() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	// Estados primitivos de infraestrutura de dados - Estritos e sem repetições
	const [reserva, setReserva] = useState<ReservaDetalheDto | null>(null);
	const [loading, setLoading] = useState(true);
	const [processando, setProcessando] = useState(false);
	const [erro, setErro] = useState("");

	// ÚNICO EFEITO: Carrega os dados da query uma única vez ao abrir a página
	useEffect(() => {
		if (!id) return;

		api
			.get<ReservaDetalheDto>(`/reservas/${id}`)
			.then((res) => {
				setReserva(res.data);
			})
			.catch((err) => {
				console.error(err);
				setErro("Não foi possível carregar os detalhes desta reserva.");
			})
			.finally(() => setLoading(false));
	}, [id]);

	// Transação 1: Cancelar / Liberar Reserva (CancelarReservaCommand)
	const handleCancelarReserva = async () => {
		if (
			!window.confirm(
				"Tem certeza que deseja cancelar esta reserva? O imóvel voltará ao status Disponível.",
			)
		) {
			return;
		}
		setErro("");
		setProcessando(true);

		try {
			await api.post(`/reservas/${id}/cancelar`);
			if (reserva) {
				setReserva({
					...reserva,
					status: typeof reserva.status === "number" ? 2 : "Cancelada",
				});
			}
			alert("Reserva cancelada com sucesso!");
		} catch (err: unknown) {
			if (isAxiosError<{ message?: string }>(err)) {
				setErro(
					err.response?.data?.message ?? "Falha ao processar o cancelamento.",
				);
			} else {
				setErro("Falha ao processar o cancelamento.");
			}
		} finally {
			setProcessando(false);
		}
	};

	// Transação 2: Concluir Compra / Efetivar Venda (CriarVendaCommand)
	// const handleConcluirCompra = async () => {
	// 	if (!reserva) return;

	// 	// Sugere o valor de tabela do apartamento, permitindo ajuste final caso haja desconto acordado
	// 	const valorConfirmado = window.prompt(
	// 		`Confirmar fechamento de contrato para ${reserva.clienteNome}.\n\nDigite o valor final da venda (R$):`,
	// 		reserva.valorApartamento.toString(),
	// 	);

	// 	if (valorConfirmado === null) return; // Operador cancelou o prompt

	// 	const valorNumerico = parseFloat(valorConfirmado);
	// 	if (isNaN(valorNumerico) || valorNumerico <= 0) {
	// 		alert("Por favor, informe um valor de venda válido.");
	// 		return;
	// 	}

	// 	setErro("");
	// 	setProcessando(true);

	// 	try {
	// 		// Dispara o CriarVendaCommand enviando os dados travados do cliente e imóvel da reserva
	// 		await api.post("/vendas", {
	// 			apartamentoId: reserva.apartamento?.id,
	// 			clienteId: reserva.cliente?.id,
	// 			valorVenda: valorNumerico,
	// 			reservaId: reserva.id,
	// 		});

	// 		// Altera o status local de forma atômica para refletir a nova situação jurídica
	// 		setReserva({
	// 			...reserva,
	// 			status: typeof reserva.status === "number" ? 1 : "Efetivada",
	// 		});

	// 		alert(
	// 			"Venda concluída com sucesso! O contrato foi gerado e a unidade foi faturada.",
	// 		);
	// 		navigate("/vendas"); // Redireciona para exibir o registro na listagem de vendas
	// 	} catch (err: unknown) {
	// 		if (isAxiosError<{ message?: string }>(err)) {
	// 			setErro(
	// 				err.response?.data?.message ?? "Falha ao processar o cancelamento.",
	// 			);
	// 		} else {
	// 			setErro("Falha ao processar o cancelamento.");
	// 		}
	// 	} finally {
	// 		setProcessando(false);
	// 	}
	// };

	if (loading)
		return (
			<p style={{ textAlign: "center", padding: "40px" }}>
				Buscando dados da reserva...
			</p>
		);
	if (erro && !reserva)
		return (
			<div style={{ color: "red", padding: "20px" }}>
				{erro} <br />
				<Link to="/reservas">Voltar</Link>
			</div>
		);
	if (!reserva)
		return (
			<p style={{ textAlign: "center", padding: "40px" }}>
				Reserva não encontrada.
			</p>
		);

	// 🚀 ESTADOS DERIVADOS (Calculados puramente em tempo de renderização, sem usar useEffect!)
	const obterLabelStatus = (status: string | number) => {
		if (status === 0 || status === "Ativa" || status === "Ativo")
			return "Ativa";
		if (status === 1 || status === "Efetivada" || status === "Concluida")
			return "Efetivada";
		if (status === 2 || status === "Cancelada" || status === "Cancelado")
			return "Cancelada";
		return String(status);
	};

	const statusLabel = obterLabelStatus(reserva.status);
	const isAtiva = statusLabel === "Ativa";

	return (
		<div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
			{/* Topo de Controle */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "20px",
				}}
			>
				<button
					onClick={() => navigate("/reservas")}
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
				<h2>Reserva Comercial</h2>
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
				{/* Painel do Cliente */}
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
						Cliente Comprador
					</h3>
					<div
						style={{
							marginTop: "15px",
							display: "flex",
							flexDirection: "column",
							gap: "10px",
						}}
					>
						<p style={{ margin: 0 }}>
							<strong>Nome:</strong> {reserva.clienteNome}
						</p>
						<p style={{ margin: 0 }}>
							<strong>CPF:</strong> {reserva.clienteCpf}
						</p>
						<p style={{ margin: 0 }}>
							<strong>Data do Bloqueio:</strong>{" "}
							{new Date(reserva.dataReserva).toLocaleDateString("pt-BR")}
						</p>
					</div>
				</div>

				{/* Painel do Apartamento */}
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
						Unidade Reservada
					</h3>
					<div
						style={{
							marginTop: "15px",
							display: "flex",
							flexDirection: "column",
							gap: "10px",
						}}
					>
						<p style={{ margin: 0 }}>
							<strong>Localização:</strong> Bloco {reserva.bloco} - Unidade{" "}
							{reserva.apartamentoNumero}
						</p>
						<p style={{ margin: 0 }}>
							<strong>Andar:</strong> {reserva.andar}º Andar
						</p>
						<p style={{ margin: 0 }}>
							<strong>Preço de Tabela:</strong>{" "}
							{reserva.valorApartamento.toLocaleString("pt-BR", {
								style: "currency",
								currency: "BRL",
							})}
						</p>
					</div>
				</div>
			</div>

			{/* Bloco de Notas */}
			<div
				style={{
					background: "white",
					padding: "24px",
					borderRadius: "8px",
					boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
					marginTop: "20px",
				}}
			>
				<h4 style={{ margin: "0 0 10px 0" }}>
					Observações e Alinhamentos Comerciais
				</h4>
				<p
					style={{
						color: "#475569",
						background: "#f8fafc",
						padding: "12px",
						borderRadius: "4px",
						minHeight: "60px",
						margin: 0,
					}}
				>
					{reserva.observacoes ||
						"Nenhuma observação registrada para esta negociação."}
				</p>
			</div>

			{/* Rodapé de Status e Decisões de Negócio */}
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
						Situação Atual:
					</span>
					<span
						style={{
							color: isAtiva
								? "#15803d"
								: statusLabel === "Cancelada"
									? "#b91c1c"
									: "#0369a1",
							background: isAtiva
								? "#dcfce7"
								: statusLabel === "Cancelada"
									? "#fee2e2"
									: "#e0f2fe",
							padding: "6px 12px",
							borderRadius: "12px",
							fontSize: "14px",
							fontWeight: "bold",
						}}
					>
						{statusLabel}
					</span>
				</div>

				{/* Ações dinâmicas injetadas com base no estado derivado 'isAtiva' */}
				{isAtiva && (
					<div style={{ display: "flex", gap: "10px" }}>
						<button
							onClick={handleCancelarReserva}
							disabled={processando}
							style={{
								padding: "10px 16px",
								background: "#ef4444",
								color: "white",
								border: "none",
								borderRadius: "4px",
								cursor: processando ? "not-allowed" : "pointer",
								fontWeight: "500",
							}}
						>
							Cancelar Reserva
						</button>
						{/* <button
							onClick={handleConcluirCompra}
							disabled={processando}
							style={{
								padding: "10px 20px",
								background: "#22c55e",
								color: "white",
								border: "none",
								borderRadius: "4px",
								cursor: processando ? "not-allowed" : "pointer",
								fontWeight: "bold",
							}}
						>
							{processando ? "Processando..." : "Concluir Compra ✓"}
						</button> */}
						<button
							onClick={() =>
								navigate(
									`/vendas/novo?apartamentoId=${reserva.apartamento?.id}&clienteId=${reserva.cliente?.id}`,
								)
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
							{processando ? "Processando..." : "Concluir Compra"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
