using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Usuarios;

public record TrocarPerfilUsuarioCommand(Guid UsuarioId, Guid PerfilId) : IRequest;
public record TrocarPerfilRequest(Guid PerfilId);

public class TrocarPerfilUsuarioCommandHandler(AppDbContext db)
	: IRequestHandler<TrocarPerfilUsuarioCommand>
{
	public async Task Handle(TrocarPerfilUsuarioCommand cmd, CancellationToken ct)
	{
		var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == cmd.UsuarioId, ct)
			?? throw new InvalidOperationException("Usuário não encontrado.");

		var perfilExiste = await db.Perfis.AnyAsync(p => p.Id == cmd.PerfilId, ct);
		if (!perfilExiste)
			throw new InvalidOperationException("Perfil não encontrado.");

		usuario.TrocarPerfil(cmd.PerfilId);
		await db.SaveChangesAsync(ct);
	}
}