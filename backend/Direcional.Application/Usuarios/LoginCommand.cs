using Direcional.Domain.Interfaces;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Usuarios;

// 🌟 Atualizado: O DTO agora devolve explicitamente o Token + Perfil (Role)
public record LoginResultDto(string Token, string Perfil);

public record LoginCommand(string Email, string Senha) : IRequest<LoginResultDto>;

public class LoginCommandHandler(AppDbContext db, IJwtService jwtService)
	: IRequestHandler<LoginCommand, LoginResultDto>

{
	public async Task<LoginResultDto> Handle(LoginCommand command, CancellationToken ct)
	{
		// 1. Busca o operador pelo e-mail informado
		var usuario = await db.Usuarios
			.FirstOrDefaultAsync(u => u.Email == command.Email, ct);

		if (usuario == null || !usuario.VerificarSenha(command.Senha))
		{
			throw new Exception("E-mail ou senha inválidos.");
		}

		var perfil = await db.Perfis
			.FirstOrDefaultAsync(p => p.Id == usuario!.PerfilId, ct);

		var roleName = perfil?.Nome ?? "Comum";

		var token = jwtService.GerarToken(usuario, roleName);

		return new LoginResultDto(token, roleName);
	}
}