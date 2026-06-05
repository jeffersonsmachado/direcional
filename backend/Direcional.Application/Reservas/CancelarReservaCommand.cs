using Direcional.Domain.Aggregates.Apartamentos;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Reservas;

public record CancelarReservaCommand(Guid Id) : IRequest;

public class CancelarReservaCommandHandler(AppDbContext db)
	: IRequestHandler<CancelarReservaCommand>
{
	public async Task Handle(CancelarReservaCommand cmd, CancellationToken ct)
	{
		var reserva = await db.Reservas.FirstOrDefaultAsync(r => r.Id == cmd.Id, ct)
			?? throw new InvalidOperationException("Reserva não encontrada.");

		if (reserva.Status != StatusReserva.Ativa)
			throw new InvalidOperationException("Apenas reservas ativas podem ser canceladas.");

		var apartamento = await db.Apartamentos.FindAsync([reserva.ApartamentoId], ct);
		apartamento?.MarcarComoDisponivel();

		reserva.Cancelar();
		await db.SaveChangesAsync(ct);
	}
}