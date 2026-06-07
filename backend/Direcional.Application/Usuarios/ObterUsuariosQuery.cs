using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Usuarios;

public record UsuarioResumoDto(Guid Id, string Nome, string Email, string Perfil);
public record UsuarioDetalheDto(Guid Id, string Nome, string Email, string Perfil);

public record ObterUsuariosQuery() : IRequest<List<UsuarioResumoDto>>;
public record ObterUsuarioPorIdQuery(Guid Id) : IRequest<UsuarioDetalheDto?>;

public class ObterUsuariosQueryHandler(AppDbContext db)
	: IRequestHandler<ObterUsuariosQuery, List<UsuarioResumoDto>>
{
	public Task<List<UsuarioResumoDto>> Handle(ObterUsuariosQuery query, CancellationToken ct)
		=> db.Usuarios
			.AsNoTracking()
			.Select(u => new UsuarioResumoDto(u.Id, u.Nome, u.Email, u.Perfil.Nome))
			.ToListAsync(ct);
}

public class ObterUsuarioPorIdQueryHandler(AppDbContext db)
	: IRequestHandler<ObterUsuarioPorIdQuery, UsuarioDetalheDto?>
{
	public Task<UsuarioDetalheDto?> Handle(ObterUsuarioPorIdQuery query, CancellationToken ct)
		=> db.Usuarios
			.AsNoTracking()
			.Where(u => u.Id == query.Id)
			.Select(u => new UsuarioDetalheDto(
				u.Id,
				u.Nome,
				u.Email,
				u.Perfil.Nome))
			.FirstOrDefaultAsync(ct);
}