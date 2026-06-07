using Direcional.Domain.Aggregates.Clientes;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

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
		var cpfEmUso = await db.Clientes.AnyAsync(c => c.CPF == cmd.CPF, ct);
		if (cpfEmUso)
			throw new InvalidOperationException("CPF já cadastrado.");
		var emailEmUso = await db.Clientes.AnyAsync(c => c.Email == cmd.Email, ct);
		if (emailEmUso)
			throw new InvalidOperationException("Email já cadastrado.");

		var cliente = Cliente.Criar(cmd.Nome, cmd.CPF, cmd.Email, cmd.Telefone);
		db.Clientes.Add(cliente);
		await db.SaveChangesAsync(ct);
		return cliente.Id;
	}
}