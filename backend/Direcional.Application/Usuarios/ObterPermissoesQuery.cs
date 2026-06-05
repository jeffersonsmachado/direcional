using Direcional.Domain.Aggregates.Usuarios;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Usuarios;

public record ObterPermissoesQuery() : IRequest<List<Permissao>>;

public class ObterPermissoesQueryHandler(AppDbContext db)
	: IRequestHandler<ObterPermissoesQuery, List<Permissao>>
{
	public Task<List<Permissao>> Handle(ObterPermissoesQuery query, CancellationToken ct)
		=> db.Permissoes.AsNoTracking().ToListAsync(ct);
}