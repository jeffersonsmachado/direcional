using Direcional.Domain.Aggregates.Usuarios;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Usuarios;

public record ObterUsuariosQuery() : IRequest<List<Usuario>>;
public record ObterUsuarioPorIdQuery(Guid Id) : IRequest<Usuario?>;

public class ObterUsuariosQueryHandler(AppDbContext db)
	: IRequestHandler<ObterUsuariosQuery, List<Usuario>>
{
	public Task<List<Usuario>> Handle(ObterUsuariosQuery query, CancellationToken ct)
		=> db.Usuarios.AsNoTracking().ToListAsync(ct);
}

public class ObterUsuarioPorIdQueryHandler(AppDbContext db)
	: IRequestHandler<ObterUsuarioPorIdQuery, Usuario?>
{
	public Task<Usuario?> Handle(ObterUsuarioPorIdQuery query, CancellationToken ct)
		=> db.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Id == query.Id, ct);
}