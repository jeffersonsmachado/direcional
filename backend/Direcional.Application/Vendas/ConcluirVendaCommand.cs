using Direcional.Domain.Aggregates.Apartamentos;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Vendas;

public record ConcluirVendaCommand(Guid VendaId) : IRequest;

public class ConcluirVendaCommandHandler(AppDbContext db) : IRequestHandler<ConcluirVendaCommand>
{
	public async Task Handle(ConcluirVendaCommand command, CancellationToken ct)
	{
		// 1. Busca a Venda e as entidades relacionadas
		var venda = await db.Vendas.FindAsync(new object[] { command.VendaId }, ct)
					?? throw new Exception("Venda não encontrada.");

		var apartamento = await db.Apartamentos.FindAsync(new object[] { venda.ApartamentoId }, ct)
						  ?? throw new Exception("Apartamento não encontrado.");

		// 2. Transição de Estado do Imóvel
		apartamento.MarcarComoVendido(); // Regra de domínio: Status = Vendido

		// 3. (Opcional) Se houver reserva vinculada, marca como Convertida
		var reserva = await db.Reservas.FirstOrDefaultAsync(r => r.ApartamentoId == apartamento.Id && r.Status == StatusReserva.Ativa, ct);
		if (reserva != null)
		{
			reserva.Converter(); // Regra de domínio: Status = Efetivada
		}

		// 4. Persistência
		await db.SaveChangesAsync(ct);
	}
}
