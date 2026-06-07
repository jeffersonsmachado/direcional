using Direcional.Domain.Aggregates.Usuarios;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Usuarios;

public record ObterPerfisQuery() : IRequest<List<Perfil>>;
public record ObterPerfilPorIdQuery(Guid Id) : IRequest<Perfil?>;

public class ObterPerfisQueryHandler(AppDbContext db)
	: IRequestHandler<ObterPerfisQuery, List<Perfil>>
{
	public Task<List<Perfil>> Handle(ObterPerfisQuery query, CancellationToken ct)
		=> db.Perfis.AsNoTracking()
			.ToListAsync(ct);
}

public class ObterPerfilPorIdQueryHandler(AppDbContext db)
	: IRequestHandler<ObterPerfilPorIdQuery, Perfil?>
{
	public Task<Perfil?> Handle(ObterPerfilPorIdQuery query, CancellationToken ct)
		=> db.Perfis.AsNoTracking()
			.FirstOrDefaultAsync(p => p.Id == query.Id, ct);
}