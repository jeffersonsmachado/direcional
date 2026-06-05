using Direcional.Domain.Aggregates.Apartamentos;
using Direcional.Infrastructure.Persistence;
using MediatR;

namespace Direcional.Application.Vendas;

public record CriarVendaCommand(
	Guid ApartamentoId,
	Guid ClienteId,
	decimal ValorVenda,
	Guid? ReservaId = null) : IRequest<Guid>;

public class CriarVendaCommandHandler(AppDbContext db)
	: IRequestHandler<CriarVendaCommand, Guid>
{
	public async Task<Guid> Handle(CriarVendaCommand cmd, CancellationToken ct)
	{
		var apartamento = await db.Apartamentos.FindAsync([cmd.ApartamentoId], ct)
			?? throw new InvalidOperationException("Apartamento não encontrado.");

		if (apartamento.Status == StatusApartamento.Vendido)
			throw new InvalidOperationException("Apartamento já foi vendido.");

		if (cmd.ReservaId.HasValue)
		{
			var reserva = await db.Reservas.FindAsync([cmd.ReservaId.Value], ct);
			reserva?.Converter();
		}

		var venda = Venda.Criar(cmd.ApartamentoId, cmd.ClienteId, cmd.ValorVenda, cmd.ReservaId);
		apartamento.MarcarComoVendido();

		db.Vendas.Add(venda);
		await db.SaveChangesAsync(ct);
		return venda.Id;
	}
}