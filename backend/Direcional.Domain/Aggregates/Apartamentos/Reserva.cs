namespace Direcional.Domain.Aggregates.Apartamentos;

public enum StatusReserva { Ativa, Cancelada, Convertida }

public class Reserva
{
	public Guid Id { get; private set; }
	public Guid ApartamentoId { get; private set; }
	public Guid ClienteId { get; private set; }
	public DateTime DataReserva { get; private set; }
	public DateTime DataExpiracao { get; private set; }
	public StatusReserva Status { get; private set; }
	public string? Observacoes { get; private set; }

	private Reserva() { }

	public static Reserva Criar(Guid apartamentoId, Guid clienteId, int diasValidade = 30, string? observacoes = null)
	{
		return new Reserva
		{
			Id = Guid.NewGuid(),
			ApartamentoId = apartamentoId,
			ClienteId = clienteId,
			DataReserva = DateTime.UtcNow,
			DataExpiracao = DateTime.UtcNow.AddDays(diasValidade),
			Status = StatusReserva.Ativa,
			Observacoes = observacoes
		};
	}

	public void Cancelar() => Status = StatusReserva.Cancelada;
	public void Converter() => Status = StatusReserva.Convertida;
}