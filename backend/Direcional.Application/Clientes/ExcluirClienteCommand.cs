using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Clientes;

public record ExcluirClienteCommand(Guid Id) : IRequest;

public class ExcluirClienteCommandHandler(AppDbContext db)
	: IRequestHandler<ExcluirClienteCommand>
{
	public async Task Handle(ExcluirClienteCommand cmd, CancellationToken ct)
	{
		var cliente = await db.Clientes.FirstOrDefaultAsync(c => c.Id == cmd.Id, ct)
			?? throw new InvalidOperationException("Cliente não encontrado.");

		var temReservaAtiva = await db.Reservas
			.AnyAsync(r => r.ClienteId == cmd.Id &&
				r.Status == Domain.Aggregates.Apartamentos.StatusReserva.Ativa, ct);
		if (temReservaAtiva)
			throw new InvalidOperationException("Cliente possui reservas ativas e não pode ser excluído.");

		db.Clientes.Remove(cliente);
		await db.SaveChangesAsync(ct);
	}
}