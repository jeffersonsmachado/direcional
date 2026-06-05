using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Usuarios;

public record AtualizarPerfilCommand(Guid Id, string Nome) : IRequest;

public class AtualizarPerfilCommandHandler(AppDbContext db)
	: IRequestHandler<AtualizarPerfilCommand>
{
	public async Task Handle(AtualizarPerfilCommand cmd, CancellationToken ct)
	{
		var perfil = await db.Perfis.FirstOrDefaultAsync(p => p.Id == cmd.Id, ct)
			?? throw new InvalidOperationException("Perfil não encontrado.");

		var nomeEmUso = await db.Perfis
			.AnyAsync(p => p.Nome == cmd.Nome && p.Id != cmd.Id, ct);
		if (nomeEmUso)
			throw new InvalidOperationException("Já existe um perfil com este nome.");

		perfil.RenomearPara(cmd.Nome);
		await db.SaveChangesAsync(ct);
	}
}