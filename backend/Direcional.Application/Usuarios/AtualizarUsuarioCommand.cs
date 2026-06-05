using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Usuarios;

public record AtualizarUsuarioCommand(Guid Id, string Nome, string Email, Guid PerfilId) : IRequest;

public class AtualizarUsuarioCommandHandler(AppDbContext db)
	: IRequestHandler<AtualizarUsuarioCommand>
{
	public async Task Handle(AtualizarUsuarioCommand cmd, CancellationToken ct)
	{
		var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == cmd.Id, ct)
			?? throw new InvalidOperationException("Usuário não encontrado.");

		var emailEmUso = await db.Usuarios
			.AnyAsync(u => u.Email == cmd.Email && u.Id != cmd.Id, ct);
		if (emailEmUso)
			throw new InvalidOperationException("E-mail já está em uso.");

		usuario.Atualizar(cmd.Nome, cmd.Email, cmd.PerfilId);
		await db.SaveChangesAsync(ct);
	}
}