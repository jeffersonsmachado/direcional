using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Usuarios;

public record ExcluirUsuarioCommand(Guid Id) : IRequest;

public class ExcluirUsuarioCommandHandler(AppDbContext db)
	: IRequestHandler<ExcluirUsuarioCommand>
{
	public async Task Handle(ExcluirUsuarioCommand cmd, CancellationToken ct)
	{
		var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == cmd.Id, ct)
			?? throw new InvalidOperationException("Usuário não encontrado.");

		db.Usuarios.Remove(usuario);
		await db.SaveChangesAsync(ct);
	}
}