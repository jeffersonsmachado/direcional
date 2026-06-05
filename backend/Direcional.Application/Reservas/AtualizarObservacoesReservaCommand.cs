using Direcional.Domain.Aggregates.Apartamentos;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Reservas;

public record AtualizarObservacoesReservaCommand(Guid Id, string? Observacoes) : IRequest;
public record AtualizarObservacoesRequest(string? Observacoes);

public class AtualizarObservacoesReservaCommandHandler(AppDbContext db)
	: IRequestHandler<AtualizarObservacoesReservaCommand>
{
	public async Task Handle(AtualizarObservacoesReservaCommand cmd, CancellationToken ct)
	{
		var reserva = await db.Reservas.FirstOrDefaultAsync(r => r.Id == cmd.Id, ct)
			?? throw new InvalidOperationException("Reserva não encontrada.");

		if (reserva.Status != StatusReserva.Ativa)
			throw new InvalidOperationException("Apenas reservas ativas podem ser editadas.");

		reserva.AtualizarObservacoes(cmd.Observacoes);
		await db.SaveChangesAsync(ct);
	}
}