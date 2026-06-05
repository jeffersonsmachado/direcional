using Direcional.Domain.Aggregates.Apartamentos;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Reservas;

public record CriarReservaCommand(
	Guid ApartamentoId,
	Guid ClienteId,
	int DiasValidade = 30,
	string? Observacoes = null) : IRequest<Guid>;

public class CriarReservaCommandHandler(AppDbContext db)
	: IRequestHandler<CriarReservaCommand, Guid>
{
	public async Task<Guid> Handle(CriarReservaCommand cmd, CancellationToken ct)
	{
		var apartamento = await db.Apartamentos.FindAsync([cmd.ApartamentoId], ct)
			?? throw new InvalidOperationException("Apartamento não encontrado.");

		if (apartamento.Status != StatusApartamento.Disponivel)
			throw new InvalidOperationException("Apartamento não está disponível para reserva.");

		var reserva = Reserva.Criar(cmd.ApartamentoId, cmd.ClienteId, cmd.DiasValidade, cmd.Observacoes);
		apartamento.MarcarComoReservado();

		db.Reservas.Add(reserva);
		await db.SaveChangesAsync(ct);
		return reserva.Id;
	}
}