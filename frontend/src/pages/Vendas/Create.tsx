import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { api } from "../../lib/api";

type ClienteDto = { id: string; nome: string; cpf: string };
type ApartamentoDto = {
	id: string;
	numero: string;
	bloco: string;
	andar: number;
	valor: number;
};

export default function VendasCreate() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const apartamentoIdUrl = searchParams.get("apartamentoId") || "";

	const [clientes, setClientes] = useState<ClienteDto[]>([]);
	const [apartamentos, setApartamentos] = useState<ApartamentoDto[]>([]);

	const [apartamentoId, setApartamentoId] = useState(apartamentoIdUrl);
	const [clienteId, setClienteId] = useState("");
	const [valorVenda, setValorVenda] = useState("");

	const [apartamentoSelecionado, setApartamentoSelecionado] =
		useState<ApartamentoDto | null>(null);
	const [loading, setLoading] = useState(true);
	const [salvando, setSalvando] = useState(false);
	const [erro, setErro] = useState("");

	useEffect(() => {
		// Carrega dados iniciais do sistema em paralelo
		const carregarDadosIniciais = async () => {
			try {
				const resClientes = await api.get<ClienteDto[]>("/clientes");
				setClientes(resClientes.data);

				// Se já veio um apartamento pela URL, busca os detalhes dele.
				// Caso contrário, lista os apartamentos disponíveis para seleção manual.
				if (apartamentoIdUrl) {
					const resAp = await api.get<ApartamentoDto>(
						`/apartamentos/${apartamentoIdUrl}`,
					);
					setApartamentoSelecionado(resAp.data);
					setValorVenda(resAp.data.valor.toString()); // Preenche o valor sugerido com o preço de tabela
				} else {
					const resAps = await api.get<ApartamentoDto[]>("/apartamentos");
					// Filtra apenas os que estão disponíveis, se o backend já não o fizer
					setApartamentos(resAps.data.filter((a) => a.id));
				}
			} catch (err) {
				console.error(err);
				setErro("Erro ao carregar dados necessários para a venda.");
			} finally {
				setLoading(false);
			}
		};

		carregarDadosIniciais();
	}, [apartamentoIdUrl]);

	// Efeito para atualizar o cabeçalho informativo caso o usuário selecione um apartamento manualmente
	useEffect(() => {
		if (!apartamentoIdUrl && apartamentoId) {
			const ap = apartamentos.find((a) => a.id === apartamentoId);
			if (ap) {
				setApartamentoSelecionado(ap);
				setValorVenda(ap.valor.toString());
			}
		}
	}, [apartamentoId, apartamentos, apartamentoIdUrl]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!apartamentoId || !clienteId || !valorVenda) {
			setErro("Todos os campos obrigatórios precisam ser preenchidos.");
			return;
		}

		setErro("");
		setSalvando(true);

		try {
			// Dispara o CriarVendaCommand estruturado para o pipeline do MediatR
			await api.post("/vendas", {
				apartamentoId,
				clienteId,
				valorVenda: parseFloat(valorVenda),
			});

			navigate("/vendas");
		} catch (err: unknown) {
			if (isAxiosError<{ message?: string }>(err)) {
				setErro(
					err.response?.data?.message ??
						"Falha ao registrar venda. Verifique se a unidade não foi vendida/reservada por outro corretor.",
				);
			} else {
				setErro(
					"Falha ao registrar venda. Verifique se a unidade não foi vendida/reservada por outro corretor.",
				);
			}
		} finally {
			setSalvando(false);
		}
	};

	if (loading)
		return (
			<p style={{ textAlign: "center", padding: "20px" }}>
				Preparando módulo de faturamento comercial...
			</p>
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
			{/* Painel informativo do Imóvel no topo da transação */}
			{apartamentoSelecionado && (
				<div
					style={{
						background: "#f8fafc",
						borderLeft: "6px solid #22c55e",
						padding: "16px",
						borderRadius: "4px",
					}}
				>
					<h3 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>
						Unidade em Negociação
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
							<strong>Bloco:</strong> {apartamentoSelecionado.bloco}
						</div>
						<div>
							<strong>Apartamento:</strong> {apartamentoSelecionado.numero}
						</div>
						<div>
							<strong>Andar:</strong> {apartamentoSelecionado.andar}º
						</div>
						<div style={{ gridColumn: "span 3" }}>
							<strong>Valor de Tabela original:</strong>{" "}
							{apartamentoSelecionado.valor.toLocaleString("pt-BR", {
								style: "currency",
								currency: "BRL",
							})}
						</div>
					</div>
				</div>
			)}

			<div
				style={{
					background: "white",
					padding: "30px",
					borderRadius: "8px",
					boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
				}}
			>
				<h2>Efetivar Contrato de Compra e Venda</h2>

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
					{/* Campo de seleção do Apartamento (Apenas se não veio travado via URL) */}
					{!apartamentoIdUrl && (
						<div
							style={{ display: "flex", flexDirection: "column", gap: "5px" }}
						>
							<label style={{ fontWeight: "500" }}>
								Selecionar Unidade Residencial *
							</label>
							<select
								value={apartamentoId}
								onChange={(e) => setApartamentoId(e.target.value)}
								required
								style={{ padding: "10px", borderRadius: "4px" }}
							>
								<option value="">-- Escolha o Apartamento --</option>
								{apartamentos.map((a) => (
									<option key={a.id} value={a.id}>
										Bloco {a.bloco} - Ap {a.numero} (Tabela: R$ {a.valor})
									</option>
								))}
							</select>
						</div>
					)}

					{/* Seleção do Cliente */}
					<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
						<label style={{ fontWeight: "500" }}>
							Selecione o Cliente Comprador *
						</label>
						<select
							value={clienteId}
							onChange={(e) => setClienteId(e.target.value)}
							required
							style={{ padding: "10px", borderRadius: "4px" }}
						>
							<option value="">-- Escolha o Cliente --</option>
							{clientes.map((c) => (
								<option key={c.id} value={c.id}>
									{c.nome} (CPF: {c.cpf})
								</option>
							))}
						</select>
					</div>

					{/* Input do Valor Real de Fechamento da Venda */}
					<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
						<label style={{ fontWeight: "500" }}>
							Valor Final de Fechamento (R$) *
						</label>
						<input
							type="number"
							step="0.01"
							placeholder="0.00"
							value={valorVenda}
							onChange={(e) => setValorVenda(e.target.value)}
							required
							style={{
								padding: "10px",
								borderRadius: "4px",
								border: "1px solid #cbd5e1",
							}}
						/>
						<small style={{ color: "#64748b" }}>
							Informe o preço real de fechamento acordado em contrato.
						</small>
					</div>

					{/* Ações */}
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
								background: "#22c55e",
								color: "white",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
								fontWeight: "bold",
							}}
						>
							{salvando ? "Emitindo Contrato..." : "Confirmar e Fechar Venda"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
