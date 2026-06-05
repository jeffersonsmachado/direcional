using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Apartamentos;

public record AtualizarValorApartamentoCommand(Guid Id, decimal Valor) : IRequest;
public record AtualizarValorRequest(decimal Valor);

public class AtualizarValorApartamentoCommandHandler(AppDbContext db)
	: IRequestHandler<AtualizarValorApartamentoCommand>
{
	public async Task Handle(AtualizarValorApartamentoCommand cmd, CancellationToken ct)
	{
		var apartamento = await db.Apartamentos.FirstOrDefaultAsync(a => a.Id == cmd.Id, ct)
			?? throw new InvalidOperationException("Apartamento não encontrado.");

		if (apartamento.Status == Domain.Aggregates.Apartamentos.StatusApartamento.Vendido)
			throw new InvalidOperationException("Não é possível editar um apartamento vendido.");

		apartamento.AtualizarValor(cmd.Valor);
		await db.SaveChangesAsync(ct);
	}
}