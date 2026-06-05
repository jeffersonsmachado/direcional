using Direcional.Domain.Aggregates.Apartamentos;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Vendas;

public record ConcluirVendaCommand(Guid Id) : IRequest;

public class ConcluirVendaCommandHandler(AppDbContext db)
	: IRequestHandler<ConcluirVendaCommand>
{
	public async Task Handle(ConcluirVendaCommand cmd, CancellationToken ct)
	{
		var venda = await db.Vendas.FirstOrDefaultAsync(v => v.Id == cmd.Id, ct)
			?? throw new InvalidOperationException("Venda não encontrada.");

		if (venda.Status != StatusVenda.EmAndamento)
			throw new InvalidOperationException("Apenas vendas em andamento podem ser concluídas.");

		venda.Concluir();
		await db.SaveChangesAsync(ct);
	}
}