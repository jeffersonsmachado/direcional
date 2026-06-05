using Direcional.Domain.Aggregates.Apartamentos;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Reservas;

public record ObterReservasQuery() : IRequest<List<Reserva>>;
public record ObterReservaPorIdQuery(Guid Id) : IRequest<Reserva?>;

public class ObterReservasQueryHandler(AppDbContext db)
	: IRequestHandler<ObterReservasQuery, List<Reserva>>
{
	public Task<List<Reserva>> Handle(ObterReservasQuery query, CancellationToken ct)
		=> db.Reservas.AsNoTracking().ToListAsync(ct);
}

public class ObterReservaPorIdQueryHandler(AppDbContext db)
	: IRequestHandler<ObterReservaPorIdQuery, Reserva?>
{
	public Task<Reserva?> Handle(ObterReservaPorIdQuery query, CancellationToken ct)
		=> db.Reservas.AsNoTracking().FirstOrDefaultAsync(r => r.Id == query.Id, ct);
}