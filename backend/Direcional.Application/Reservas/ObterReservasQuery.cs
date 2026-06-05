using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Reservas;

public record ReservaDto(
	Guid Id,
	Guid ApartamentoId,
	Guid ClienteId,
	DateTime DataReserva,
	DateTime DataExpiracao,
	string Status,
	string? Observacoes);

public record ObterReservasQuery() : IRequest<List<ReservaDto>>;
public record ObterReservaPorIdQuery(Guid Id) : IRequest<ReservaDto?>;

public class ObterReservasQueryHandler(AppDbContext db)
	: IRequestHandler<ObterReservasQuery, List<ReservaDto>>
{
	public Task<List<ReservaDto>> Handle(ObterReservasQuery query, CancellationToken ct)
		=> db.Reservas
			.AsNoTracking()
			.Select(r => new ReservaDto(r.Id, r.ApartamentoId, r.ClienteId, r.DataReserva, r.DataExpiracao, r.Status.ToString(), r.Observacoes))
			.ToListAsync(ct);
}

public class ObterReservaPorIdQueryHandler(AppDbContext db)
	: IRequestHandler<ObterReservaPorIdQuery, ReservaDto?>
{
	public Task<ReservaDto?> Handle(ObterReservaPorIdQuery query, CancellationToken ct)
		=> db.Reservas
			.AsNoTracking()
			.Where(r => r.Id == query.Id)
			.Select(r => new ReservaDto(r.Id, r.ApartamentoId, r.ClienteId, r.DataReserva, r.DataExpiracao, r.Status.ToString(), r.Observacoes))
			.FirstOrDefaultAsync(ct);
}