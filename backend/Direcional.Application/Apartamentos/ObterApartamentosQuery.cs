using Direcional.Domain.Aggregates.Apartamentos;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Apartamentos;

public record ObterApartamentosQuery() : IRequest<List<Apartamento>>;
public record ObterApartamentoPorIdQuery(Guid Id) : IRequest<Apartamento?>;

public class ObterApartamentosQueryHandler(AppDbContext db)
	: IRequestHandler<ObterApartamentosQuery, List<Apartamento>>
{
	public Task<List<Apartamento>> Handle(ObterApartamentosQuery query, CancellationToken ct)
		=> db.Apartamentos.AsNoTracking().ToListAsync(ct);
}

public class ObterApartamentoPorIdQueryHandler(AppDbContext db)
	: IRequestHandler<ObterApartamentoPorIdQuery, Apartamento?>
{
	public Task<Apartamento?> Handle(ObterApartamentoPorIdQuery query, CancellationToken ct)
		=> db.Apartamentos.AsNoTracking().FirstOrDefaultAsync(a => a.Id == query.Id, ct);
}