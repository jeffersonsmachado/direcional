namespace Direcional.Domain.Aggregates.Apartamentos;

public enum StatusApartamento { Disponivel, Reservado, Vendido }

public class Apartamento
{
	public Guid Id { get; private set; }
	public string Numero { get; private set; } = string.Empty;
	public string Bloco { get; private set; } = string.Empty;
	public int Andar { get; private set; }
	public decimal Area { get; private set; }
	public decimal Valor { get; private set; }
	public StatusApartamento Status { get; private set; }

	private Apartamento() { }

	public static Apartamento Criar(string numero, string bloco, int andar, decimal area, decimal valor)
	{
		return new Apartamento
		{
			Id = Guid.NewGuid(),
			Numero = numero,
			Bloco = bloco,
			Andar = andar,
			Area = area,
			Valor = valor,
			Status = StatusApartamento.Disponivel
		};
	}

	public void MarcarComoReservado() => Status = StatusApartamento.Reservado;
	public void MarcarComoVendido() => Status = StatusApartamento.Vendido;
	public void MarcarComoDisponivel() => Status = StatusApartamento.Disponivel;
}