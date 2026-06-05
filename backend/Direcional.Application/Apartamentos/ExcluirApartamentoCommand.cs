using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Apartamentos;

public record ExcluirApartamentoCommand(Guid Id) : IRequest;

public class ExcluirApartamentoCommandHandler(AppDbContext db)
	: IRequestHandler<ExcluirApartamentoCommand>
{
	public async Task Handle(ExcluirApartamentoCommand cmd, CancellationToken ct)
	{
		var apartamento = await db.Apartamentos.FirstOrDefaultAsync(a => a.Id == cmd.Id, ct)
			?? throw new InvalidOperationException("Apartamento não encontrado.");

		if (apartamento.Status != Domain.Aggregates.Apartamentos.StatusApartamento.Disponivel)
			throw new InvalidOperationException("Apenas apartamentos disponíveis podem ser excluídos.");

		db.Apartamentos.Remove(apartamento);
		await db.SaveChangesAsync(ct);
	}
}