using Direcional.Domain.Aggregates.Clientes;
using Direcional.Infrastructure.Persistence;
using MediatR;

namespace Direcional.Application.Clientes;

public record CriarClienteCommand(
	string Nome,
	string CPF,
	string Email,
	string Telefone) : IRequest<Guid>;

public class CriarClienteCommandHandler(AppDbContext db)
	: IRequestHandler<CriarClienteCommand, Guid>
{
	public async Task<Guid> Handle(CriarClienteCommand cmd, CancellationToken ct)
	{
		var cliente = Cliente.Criar(cmd.Nome, cmd.CPF, cmd.Email, cmd.Telefone);
		db.Clientes.Add(cliente);
		await db.SaveChangesAsync(ct);
		return cliente.Id;
	}
}