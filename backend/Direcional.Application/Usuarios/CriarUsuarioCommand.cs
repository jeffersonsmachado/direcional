using Direcional.Domain.Aggregates.Usuarios;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Usuarios;

public record CriarUsuarioCommand(
	string Nome,
	string Email,
	string Senha,
	Guid PerfilId) : IRequest<Guid>;

public class CriarUsuarioCommandHandler(AppDbContext db)
	: IRequestHandler<CriarUsuarioCommand, Guid>
{
	public async Task<Guid> Handle(CriarUsuarioCommand cmd, CancellationToken ct)
	{
		var emailEmUso = await db.Usuarios.AnyAsync(u => u.Email == cmd.Email, ct);
		if (emailEmUso)
			throw new InvalidOperationException("E-mail já está em uso.");

		var senhaHash = BCrypt.Net.BCrypt.HashPassword(cmd.Senha);
		var usuario = Usuario.Criar(cmd.Nome, cmd.Email, senhaHash, cmd.PerfilId);
		db.Usuarios.Add(usuario);
		await db.SaveChangesAsync(ct);
		return usuario.Id;
	}
}