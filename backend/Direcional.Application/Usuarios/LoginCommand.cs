using Direcional.Domain.Interfaces;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Usuarios;

public record LoginCommand(string Email, string Senha) : IRequest<string>;

public class LoginCommandHandler(AppDbContext db, IJwtService jwtService)
	: IRequestHandler<LoginCommand, string>
{
	public async Task<string> Handle(LoginCommand cmd, CancellationToken ct)
	{
		var usuario = await db.Usuarios
			.Include(u => u.Perfil)
				.ThenInclude(p => p.Permissoes)
					.ThenInclude(pp => pp.Permissao)
			.FirstOrDefaultAsync(u => u.Email == cmd.Email, ct)
			?? throw new UnauthorizedAccessException("Credenciais inválidas.");

		var permissoes = usuario.Perfil.Permissoes.Select(pp => pp.Permissao.Chave).ToList();
		return jwtService.GerarToken(usuario.Id, usuario.Email, usuario.Perfil.Nome, permissoes);
	}
}