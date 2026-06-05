using Direcional.Domain.Aggregates.Apartamentos;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Apartamentos;

public record ApartamentoDto(
	Guid Id,
	string Numero,
	string Bloco,
	int Andar,
	decimal Area,
	decimal Valor,
	string Status);

public record ObterApartamentosQuery() : IRequest<List<ApartamentoDto>>;
public record ObterApartamentoPorIdQuery(Guid Id) : IRequest<ApartamentoDto?>;

public class ObterApartamentosQueryHandler(AppDbContext db)
	: IRequestHandler<ObterApartamentosQuery, List<ApartamentoDto>>
{
	public Task<List<ApartamentoDto>> Handle(ObterApartamentosQuery query, CancellationToken ct)
		=> db.Apartamentos
			.AsNoTracking()
			.Select(a => new ApartamentoDto(a.Id, a.Numero, a.Bloco, a.Andar, a.Area, a.Valor, a.Status.ToString()))
			.ToListAsync(ct);
}

public class ObterApartamentoPorIdQueryHandler(AppDbContext db)
	: IRequestHandler<ObterApartamentoPorIdQuery, ApartamentoDto?>
{
	public Task<ApartamentoDto?> Handle(ObterApartamentoPorIdQuery query, CancellationToken ct)
		=> db.Apartamentos
			.AsNoTracking()
			.Where(a => a.Id == query.Id)
			.Select(a => new ApartamentoDto(a.Id, a.Numero, a.Bloco, a.Andar, a.Area, a.Valor, a.Status.ToString()))
			.FirstOrDefaultAsync(ct);
}