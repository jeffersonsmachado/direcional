using Direcional.Domain.Aggregates.Apartamentos;
using Direcional.Infrastructure.Persistence;
using MediatR;

namespace Direcional.Application.Apartamentos;

public record CriarApartamentoCommand(
	string Numero,
	string Bloco,
	int Andar,
	decimal Area,
	decimal Valor) : IRequest<Guid>;

public class CriarApartamentoCommandHandler(AppDbContext db)
	: IRequestHandler<CriarApartamentoCommand, Guid>
{
	public async Task<Guid> Handle(CriarApartamentoCommand cmd, CancellationToken ct)
	{
		var apartamento = Apartamento.Criar(cmd.Numero, cmd.Bloco, cmd.Andar, cmd.Area, cmd.Valor);
		db.Apartamentos.Add(apartamento);
		await db.SaveChangesAsync(ct);
		return apartamento.Id;
	}
}