using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Clientes;

public record AtualizarClienteCommand(Guid Id, string Nome, string Email, string Telefone) : IRequest;

public class AtualizarClienteCommandHandler(AppDbContext db)
	: IRequestHandler<AtualizarClienteCommand>
{
	public async Task Handle(AtualizarClienteCommand cmd, CancellationToken ct)
	{
		var cliente = await db.Clientes.FirstOrDefaultAsync(c => c.Id == cmd.Id, ct)
			?? throw new InvalidOperationException("Cliente não encontrado.");

		var emailEmUso = await db.Clientes
			.AnyAsync(c => c.Email == cmd.Email && c.Id != cmd.Id, ct);
		if (emailEmUso)
			throw new InvalidOperationException("E-mail já está em uso.");

		cliente.Atualizar(cmd.Nome, cmd.Email, cmd.Telefone);
		await db.SaveChangesAsync(ct);
	}
}