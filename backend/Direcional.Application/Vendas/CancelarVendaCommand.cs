using Direcional.Domain.Aggregates.Apartamentos;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Vendas;

public record CancelarVendaCommand(Guid Id) : IRequest;

public class CancelarVendaCommandHandler(AppDbContext db)
	: IRequestHandler<CancelarVendaCommand>
{
	public async Task Handle(CancelarVendaCommand cmd, CancellationToken ct)
	{
		var venda = await db.Vendas.FirstOrDefaultAsync(v => v.Id == cmd.Id, ct)
			?? throw new InvalidOperationException("Venda não encontrada.");

		if (venda.Status != StatusVenda.EmAndamento)
			throw new InvalidOperationException("Apenas vendas em andamento podem ser canceladas.");

		var apartamento = await db.Apartamentos.FindAsync([venda.ApartamentoId], ct);
		apartamento?.MarcarComoDisponivel();

		venda.Cancelar();
		await db.SaveChangesAsync(ct);
	}
}