using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Usuarios;

public record AlterarSenhaRequest(string SenhaAtual, string NovaSenha);
public record AlterarSenhaCommand(Guid Id, string SenhaAtual, string NovaSenha) : IRequest;

public class AlterarSenhaCommandHandler(AppDbContext db)
	: IRequestHandler<AlterarSenhaCommand>
{
	public async Task Handle(AlterarSenhaCommand cmd, CancellationToken ct)
	{
		var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == cmd.Id, ct)
			?? throw new InvalidOperationException("Usuário não encontrado.");

		if (!BCrypt.Net.BCrypt.Verify(cmd.SenhaAtual, usuario.SenhaHash))
			throw new UnauthorizedAccessException("Senha atual incorreta.");

		var novaSenhaHash = BCrypt.Net.BCrypt.HashPassword(cmd.NovaSenha);
		usuario.AlterarSenha(novaSenhaHash);
		await db.SaveChangesAsync(ct);
	}
}