using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Apartamentos;

public record AtualizarApartamentoCommand(
	Guid Id,
	string Numero,
	string Bloco,
	int Andar,
	decimal Area,
	decimal Valor) : IRequest;

public class AtualizarApartamentoCommandHandler(AppDbContext db)
	: IRequestHandler<AtualizarApartamentoCommand>
{
	public async Task Handle(AtualizarApartamentoCommand cmd, CancellationToken ct)
	{
		var apartamento = await db.Apartamentos.FirstOrDefaultAsync(a => a.Id == cmd.Id, ct)
			?? throw new InvalidOperationException("Apartamento não encontrado.");

		if (apartamento.Status == Domain.Aggregates.Apartamentos.StatusApartamento.Vendido)
			throw new InvalidOperationException("Não é possível editar um apartamento vendido.");

		apartamento.Atualizar(cmd.Numero, cmd.Bloco, cmd.Andar, cmd.Area, cmd.Valor);
		await db.SaveChangesAsync(ct);
	}
}