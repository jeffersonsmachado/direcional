import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { api } from "../../lib/api";
import { NumericFormat } from "react-number-format";
import ListaClientesSeletor from "../../components/BuscaClientes";
import ListaApartamentosSeletor from "../../components/BuscaApartamentos";

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
	const clienteIdUrl = searchParams.get("clienteId") || "";

	const [cliente, setCliente] = useState<ClienteDto>();
	const [apartamento, setApartamento] = useState<ApartamentoDto>();
	const [apartamentoId, setApartamentoId] = useState(apartamentoIdUrl);
	const [clienteId, setClienteId] = useState(clienteIdUrl);

	const [valorVenda, setValorVenda] = useState("");

	const [salvando, setSalvando] = useState(false);
	const [erro, setErro] = useState("");

	useEffect(() => {
		if (clienteIdUrl && apartamentoIdUrl) {
			Promise.all([
				api.get<ClienteDto>(`/clientes/${clienteIdUrl}`),
				api.get<ApartamentoDto>(`/apartamentos/${apartamentoIdUrl}`),
			])
				.then(([resCliente, resApartamentos]) => {
					setCliente(resCliente.data);

					setApartamento(resApartamentos.data);

					setValorVenda(resApartamentos.data.valor.toString());
					setClienteId(resCliente.data.id);
				})
				.catch((err) => {
					console.error(err);
					setErro("Erro ao carregar dados necessários para a venda.");
				});
		} else if (apartamentoId) {
			api
				.get<ApartamentoDto>(`/apartamentos/${apartamentoId}`)
				.then((res) => {
					setApartamento(res.data);
					setValorVenda(res.data.valor.toString());
				})
				.catch((err: unknown) => {
					if (isAxiosError(err)) {
						setErro(err.response?.data?.message ?? "Erro ao carregar dados.");
					} else {
						setErro("Erro ao carregar dados.");
					}
				});
		}
	}, [clienteIdUrl, apartamentoIdUrl, apartamentoId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!apartamentoId || !clienteId || !valorVenda) {
			setErro("Todos os campos obrigatórios precisam ser preenchidos.");
			return;
		}

		setErro("");
		setSalvando(true);

		try {
			await api.post("/vendas", {
				apartamentoId: apartamentoId,
				clienteId: clienteId,
				valorVenda: parseFloat(valorVenda),
			});

			navigate("/vendas");
		} catch (err: unknown) {
			if (isAxiosError<{ detail?: string }>(err)) {
				setErro(
					err.response?.data?.detail ??
						"Falha ao registrar venda. Verifique se a unidade não foi vendida/reservada.",
				);
			} else {
				setErro(
					"Falha ao registrar venda. Verifique se a unidade não foi vendida/reservada.",
				);
			}
		} finally {
			setSalvando(false);
		}
	};

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
			{apartamento && (
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
							<strong>Bloco:</strong> {apartamento.bloco}
						</div>
						<div>
							<strong>Apartamento:</strong> {apartamento.numero}
						</div>
						<div>
							<strong>Andar:</strong> {apartamento.andar}º
						</div>
						<div style={{ gridColumn: "span 3" }}>
							<strong>Valor de Tabela original:</strong>{" "}
							{apartamento.valor.toLocaleString("pt-BR", {
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
					{!apartamentoIdUrl && (
						<div
							style={{ display: "flex", flexDirection: "column", gap: "5px" }}
						>
							<label style={{ fontWeight: "500" }}>
								Selecionar Unidade Residencial *
							</label>
							<ListaApartamentosSeletor
								onApartamentoSelecionado={(e) => setApartamentoId(e)}
							/>
						</div>
					)}

					{!clienteIdUrl && (
						<div
							style={{ display: "flex", flexDirection: "column", gap: "5px" }}
						>
							<label style={{ fontWeight: "500" }}>
								Selecione o Cliente Comprador *
							</label>
							<ListaClientesSeletor
								onClienteSelecionado={(e) => setClienteId(e)}
							/>
						</div>
					)}

					{/* Painel do Cliente */}
					{clienteIdUrl && (
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
									<strong>Nome:</strong> {cliente?.nome}
								</p>
								<p style={{ margin: 0 }}>
									<strong>CPF:</strong> {cliente?.cpf}
								</p>
							</div>
						</div>
					)}

					<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
						<label style={{ fontWeight: "500" }}>
							Valor Final de Fechamento (R$) *
						</label>
						<NumericFormat
							value={valorVenda}
							onValueChange={(values) => {
								setValorVenda(values.value);
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
						<small style={{ color: "#64748b" }}>
							Informe o preço real de fechamento acordado em contrato.
						</small>
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
							onClick={() => navigate(-1)}
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
