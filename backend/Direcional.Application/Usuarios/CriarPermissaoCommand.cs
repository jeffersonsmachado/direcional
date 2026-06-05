using Direcional.Domain.Aggregates.Usuarios;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Usuarios;

public record AssociarPermissaoCommand(Guid PerfilId, Guid PermissaoId) : IRequest;
public record RemoverPermissaoCommand(Guid PerfilId, Guid PermissaoId) : IRequest;

public class AssociarPermissaoCommandHandler(AppDbContext db)
	: IRequestHandler<AssociarPermissaoCommand>
{
	public async Task Handle(AssociarPermissaoCommand cmd, CancellationToken ct)
	{
		var existe = await db.PerfilPermissoes
			.AnyAsync(pp => pp.PerfilId == cmd.PerfilId && pp.PermissaoId == cmd.PermissaoId, ct);

		if (!existe)
		{
			db.PerfilPermissoes.Add(PerfilPermissao.Criar(cmd.PerfilId, cmd.PermissaoId));
			await db.SaveChangesAsync(ct);
		}
	}
}

public class RemoverPermissaoCommandHandler(AppDbContext db)
	: IRequestHandler<RemoverPermissaoCommand>
{
	public async Task Handle(RemoverPermissaoCommand cmd, CancellationToken ct)
	{
		var pp = await db.PerfilPermissoes
			.FirstOrDefaultAsync(pp => pp.PerfilId == cmd.PerfilId && pp.PermissaoId == cmd.PermissaoId, ct);

		if (pp is not null)
		{
			db.PerfilPermissoes.Remove(pp);
			await db.SaveChangesAsync(ct);
		}
	}
}