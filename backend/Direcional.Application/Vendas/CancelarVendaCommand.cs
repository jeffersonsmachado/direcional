using Direcional.Domain.Aggregates.Apartamentos;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Vendas;

public record CancelarVendaCommand(Guid VendaId) : IRequest;

public class CancelarVendaCommandHandler(AppDbContext db) : IRequestHandler<CancelarVendaCommand>
{
	public async Task Handle(CancelarVendaCommand command, CancellationToken ct)
	{
		var venda = await db.Vendas.FindAsync(new object[] { command.VendaId }, ct)
					?? throw new Exception("Venda não encontrada.");

		var apartamento = await db.Apartamentos.FindAsync(new object[] { venda.ApartamentoId }, ct)
						  ?? throw new Exception("Apartamento não encontrado.");

		// 1. Regra de Negócio: Cancelar venda
		venda.Cancelar(); // Status = Cancelado

		// 2. Regra de Negócio: Disponibilizar apartamento
		apartamento.MarcarComoDisponivel(); // Status = Disponivel

		// 3. Persistência
		await db.SaveChangesAsync(ct);
	}
}