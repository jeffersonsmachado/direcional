using Direcional.Domain.Aggregates.Apartamentos;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Vendas;

public record ObterVendasQuery() : IRequest<List<Venda>>;
public record ObterVendaPorIdQuery(Guid Id) : IRequest<Venda?>;

public class ObterVendasQueryHandler(AppDbContext db)
	: IRequestHandler<ObterVendasQuery, List<Venda>>
{
	public Task<List<Venda>> Handle(ObterVendasQuery query, CancellationToken ct)
		=> db.Vendas.AsNoTracking().ToListAsync(ct);
}

public class ObterVendaPorIdQueryHandler(AppDbContext db)
	: IRequestHandler<ObterVendaPorIdQuery, Venda?>
{
	public Task<Venda?> Handle(ObterVendaPorIdQuery query, CancellationToken ct)
		=> db.Vendas.AsNoTracking().FirstOrDefaultAsync(v => v.Id == query.Id, ct);
}