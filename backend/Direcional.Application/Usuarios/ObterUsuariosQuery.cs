using Direcional.Application.Common;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Usuarios;

public record UsuarioResumoDto(Guid Id, string Nome, string Email, string Perfil);
public record UsuarioDetalheDto(Guid Id, string Nome, string Email, string Perfil);

public record ObterUsuariosQuery(int PageNumber = 1, int PageSize = 10) : IRequest<PagedResultDto<UsuarioResumoDto>>;
public record ObterUsuarioPorIdQuery(Guid Id) : IRequest<UsuarioDetalheDto?>;

public class ObterUsuariosQueryHandler(AppDbContext db)
	: IRequestHandler<ObterUsuariosQuery, PagedResultDto<UsuarioResumoDto>>
{
	public async Task<PagedResultDto<UsuarioResumoDto>> Handle(ObterUsuariosQuery query, CancellationToken ct)
	{
		int pageNumber = query.PageNumber < 1 ? 1 : query.PageNumber;
		int pageSize = query.PageSize < 1 ? 10 : query.PageSize;

		var queryBase = db.Usuarios.AsNoTracking();
		var totalCount = await queryBase.CountAsync(ct);

		var items = await queryBase
			.OrderBy(a => a.Nome)
			.ThenBy(a => a.Email)
			.Skip((pageNumber - 1) * pageSize)
			.Take(pageSize)
			.Select(u => new UsuarioResumoDto(u.Id, u.Nome, u.Email, u.Perfil.Nome))
			.ToListAsync(ct);

		return new PagedResultDto<UsuarioResumoDto>(items, totalCount, pageNumber, pageSize);
	}
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