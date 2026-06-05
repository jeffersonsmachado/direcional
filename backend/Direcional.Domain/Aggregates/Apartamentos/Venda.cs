namespace Direcional.Domain.Aggregates.Apartamentos;

public enum StatusVenda { EmAndamento, Concluida, Cancelada }

public class Venda
{
	public Guid Id { get; private set; }
	public Guid ApartamentoId { get; private set; }
	public Guid ClienteId { get; private set; }
	public Guid? ReservaId { get; private set; }
	public DateTime DataVenda { get; private set; }
	public decimal ValorVenda { get; private set; }
	public StatusVenda Status { get; private set; }

	private Venda() { }

	public static Venda Criar(Guid apartamentoId, Guid clienteId, decimal valorVenda, Guid? reservaId = null)
	{
		return new Venda
		{
			Id = Guid.NewGuid(),
			ApartamentoId = apartamentoId,
			ClienteId = clienteId,
			ReservaId = reservaId,
			DataVenda = DateTime.UtcNow,
			ValorVenda = valorVenda,
			Status = StatusVenda.EmAndamento
		};
	}

	public void Concluir() => Status = StatusVenda.Concluida;
	public void Cancelar() => Status = StatusVenda.Cancelada;
}