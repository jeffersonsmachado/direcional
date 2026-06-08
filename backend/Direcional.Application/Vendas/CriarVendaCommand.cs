using Direcional.Domain.Aggregates.Apartamentos;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

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
		var apartamento = await db.Apartamentos.FindAsync(new object[] { cmd.ApartamentoId }, ct)
			?? throw new Exception("Apartamento não encontrado.");

		if (apartamento.Status == StatusApartamento.Vendido)
			throw new Exception("Esta unidade já foi vendida.");

		var venda = Venda.Criar(cmd.ApartamentoId, cmd.ClienteId, cmd.ValorVenda, cmd.ReservaId);
		await db.Vendas.AddAsync(venda, ct);

		apartamento.MarcarComoVendido();

		var reservaPendente = await db.Reservas
			.FirstOrDefaultAsync(r =>
				r.ApartamentoId == cmd.ApartamentoId &&
				r.Status == StatusReserva.Ativa, ct);

		if (reservaPendente != null)
		{
			if (reservaPendente.ClienteId != cmd.ClienteId)
			{
				throw new Exception("Este apartamento está reservado para outro cliente.");
			}

			reservaPendente.Converter();
		}

		await db.SaveChangesAsync(ct);

		return venda.Id;
	}
}