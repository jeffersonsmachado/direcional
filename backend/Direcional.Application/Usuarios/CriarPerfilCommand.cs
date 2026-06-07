using Direcional.Domain.Aggregates.Usuarios;
using Direcional.Infrastructure.Persistence;
using MediatR;

namespace Direcional.Application.Usuarios;

public record CriarPerfilCommand(string Nome) : IRequest<Guid>;

public class CriarPerfilCommandHandler(AppDbContext db)
	: IRequestHandler<CriarPerfilCommand, Guid>
{
	public async Task<Guid> Handle(CriarPerfilCommand cmd, CancellationToken ct)
	{
		var perfil = Perfil.Criar(cmd.Nome);
		db.Perfis.Add(perfil);
		await db.SaveChangesAsync(ct);

		return perfil.Id;
	}
}