using Direcional.Domain.Aggregates.Clientes;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Clientes;

public record ObterClientesQuery() : IRequest<List<Cliente>>;
public record ObterClientePorIdQuery(Guid Id) : IRequest<Cliente?>;

public class ObterClientesQueryHandler(AppDbContext db)
	: IRequestHandler<ObterClientesQuery, List<Cliente>>
{
	public Task<List<Cliente>> Handle(ObterClientesQuery query, CancellationToken ct)
		=> db.Clientes.AsNoTracking().ToListAsync(ct);
}

public class ObterClientePorIdQueryHandler(AppDbContext db)
	: IRequestHandler<ObterClientePorIdQuery, Cliente?>
{
	public Task<Cliente?> Handle(ObterClientePorIdQuery query, CancellationToken ct)
		=> db.Clientes.AsNoTracking().FirstOrDefaultAsync(c => c.Id == query.Id, ct);
}