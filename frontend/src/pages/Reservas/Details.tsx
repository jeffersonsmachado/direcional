import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { api } from "../../lib/api";

// Definição de interface robusta que aceita tanto o objeto aninhado do EF Core quanto campos planos
type ReservaDetalheDto = {
	id: string;
	dataReserva: string;
	status: string | number; // Aceita string ("Ativa") ou int (0)
	observacoes?: string;

	// Suporte a propriedades planas (Flat DTO)
	clienteNome?: string;
	clienteCpf?: string;
	apartamentoNumero?: string;
	bloco?: string;
	andar?: number;
	valorApartamento?: number;

	// Suporte a Objetos Aninhados (Padrão EF Core Include)
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
	const [reserva, setReserva] = useState<ReservaDetalheDto | null>(null);
	const [loading, setLoading] = useState(true);
	const [processando, setProcessando] = useState(false);
	const [erro, setErro] = useState("");

	useEffect(() => {
		if (!id) return;

		api
			.get<ReservaDetalheDto>(`/reservas/${id}`)
			.then((res) => setReserva(res.data))
			.catch((err) => {
				console.error(err);
				setErro(
					"Não foi possível carregar os detalhes desta reserva. Verifique a conexão com a API.",
				);
			})
			.finally(() => setLoading(false));
	}, [id]);

	// Função auxiliar para normalizar e ler o Status (seja ele número do C# ou string)
	const obterLabelStatus = (status: string | number) => {
		if (status === 0 || status === "Ativa") return "Ativa";
		if (status === 1 || status === "Efetivada" || status === "Concluida")
			return "Efetivada";
		if (status === 2 || status === "Cancelada") return "Cancelada";
		return String(status);
	};

	const handleCancelarReserva = async () => {
		if (
			!window.confirm(
				"Tem certeza que deseja cancelar esta reserva? O apartamento voltará ao status Disponível.",
			)
		) {
			return;
		}

		setErro("");
		setProcessando(true);

		try {
			// Dispara o CancelarReservaCommand no backend .NET
			await api.patch(`/reservas/${id}/cancelar`);

			if (reserva) {
				// Atualiza dinamicamente mantendo a consistência visual
				setReserva({
					...reserva,
					status: typeof reserva.status === "number" ? 2 : "Cancelada",
				});
			}
			alert("Reserva cancelada e unidade liberada com sucesso!");
		} catch (err: unknown) {
			if (isAxiosError<{ message?: string }>(err)) {
				setErro(
					err.response?.data?.message ??
						"Falha ao processar o cancelamento no servidor.",
				);
			} else {
				setErro("Falha ao processar o cancelamento no servidor.");
			}
		} finally {
			setProcessando(false);
		}
	};

	if (loading)
		return (
			<p style={{ textAlign: "center", padding: "20px" }}>
				Carregando dados da reserva...
			</p>
		);
	if (erro && !reserva)
		return (
			<div style={{ color: "red", padding: "20px" }}>
				{erro} <br />
				<Link to="/reservas">Voltar para a lista</Link>
			</div>
		);
	if (!reserva)
		return (
			<p style={{ textAlign: "center", padding: "20px" }}>
				Reserva não encontrada.
			</p>
		);

	// Extração inteligente extraindo do nó aninhado ou do nó plano de forma segura
	const nomeCliente =
		reserva.cliente?.nome || reserva.clienteNome || "Não informado";
	const cpfCliente =
		reserva.cliente?.cpf || reserva.clienteCpf || "Não informado";

	const apBloco = reserva.apartamento?.bloco || reserva.bloco || "N/A";
	const apNumero =
		reserva.apartamento?.numero || reserva.apartamentoNumero || "N/A";
	const apAndar =
		reserva.apartamento?.andar !== undefined
			? reserva.apartamento.andar
			: reserva.andar;
	const apValor =
		reserva.apartamento?.valor !== undefined
			? reserva.apartamento.valor
			: reserva.valorApartamento;

	const statusLabel = obterLabelStatus(reserva.status);
	const podeCancelar = reserva.status === 0 || reserva.status === "Ativa";

	return (
		<div style={{ maxWidth: "800px", margin: "0 auto" }}>
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
				<h2>Reserva Comercial # {reserva.id.substring(0, 8)}...</h2>
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
				{/* Painel do Cliente Comprador */}
				<div
					style={{
						background: "white",
						padding: "20px",
						borderRadius: "8px",
						boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
					}}
				>
					<h3
						style={{
							color: "#1e293b",
							borderBottom: "2px solid #e2e8f0",
							paddingBottom: "8px",
							marginTop: 0,
						}}
					>
						Cliente Vincunlado
					</h3>
					<p style={{ margin: "10px 0" }}>
						<strong>Nome:</strong> {nomeCliente}
					</p>
					<p style={{ margin: "10px 0" }}>
						<strong>CPF:</strong> {cpfCliente}
					</p>
					<p style={{ margin: "10px 0" }}>
						<strong>Data de Criação:</strong>{" "}
						{new Date(reserva.dataReserva).toLocaleDateString("pt-BR")}
					</p>
				</div>

				{/* Painel da Unidade Habitacional */}
				<div
					style={{
						background: "white",
						padding: "20px",
						borderRadius: "8px",
						boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
					}}
				>
					<h3
						style={{
							color: "#1e293b",
							borderBottom: "2px solid #e2e8f0",
							paddingBottom: "8px",
							marginTop: 0,
						}}
					>
						Unidade Reservada
					</h3>
					<p style={{ margin: "10px 0" }}>
						<strong>Localização:</strong> Bloco {apBloco} - Unidade {apNumero}
					</p>
					<p style={{ margin: "10px 0" }}>
						<strong>Pavimento:</strong>{" "}
						{apAndar !== undefined ? `${apAndar}º Andar` : "Não informado"}
					</p>
					<p style={{ margin: "10px 0" }}>
						<strong>Valor de Tabela:</strong>{" "}
						{apValor !== undefined
							? apValor.toLocaleString("pt-BR", {
									style: "currency",
									currency: "BRL",
								})
							: "Não informado"}
					</p>
				</div>
			</div>

			{/* Observações da Negociação */}
			<div
				style={{
					background: "white",
					padding: "20px",
					borderRadius: "8px",
					boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
					marginTop: "20px",
				}}
			>
				<h4 style={{ margin: "0 0 8px 0" }}>Observações e Condições Gerais</h4>
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
						"Nenhuma observação registrada para esta reserva."}
				</p>
			</div>

			{/* Rodapé de Status & Ações */}
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
						Situação do Registro:
					</span>
					<strong
						style={{
							color:
								statusLabel === "Ativa"
									? "#15803d"
									: statusLabel === "Cancelada"
										? "#b91c1c"
										: "#a16207",
							background:
								statusLabel === "Ativa"
									? "#dcfce7"
									: statusLabel === "Cancelada"
										? "#fee2e2"
										: "#fef9c3",
							padding: "6px 12px",
							borderRadius: "12px",
							fontSize: "14px",
						}}
					>
						{statusLabel}
					</strong>
				</div>

				{podeCancelar && (
					<button
						onClick={handleCancelarReserva}
						disabled={processando}
						style={{
							padding: "10px 20px",
							background: "#ef4444",
							color: "white",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
							fontWeight: "bold",
						}}
					>
						{processando
							? "Processando..."
							: "Disponibilizar Imóvel (Cancelar Reserva)"}
					</button>
				)}
			</div>
		</div>
	);
}
