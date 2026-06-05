using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Vendas;

public record VendaDto(
	Guid Id,
	Guid ApartamentoId,
	Guid ClienteId,
	Guid? ReservaId,
	DateTime DataVenda,
	decimal ValorVenda,
	string Status);

public record ObterVendasQuery() : IRequest<List<VendaDto>>;
public record ObterVendaPorIdQuery(Guid Id) : IRequest<VendaDto?>;

public class ObterVendasQueryHandler(AppDbContext db)
	: IRequestHandler<ObterVendasQuery, List<VendaDto>>
{
	public Task<List<VendaDto>> Handle(ObterVendasQuery query, CancellationToken ct)
		=> db.Vendas
			.AsNoTracking()
			.Select(v => new VendaDto(v.Id, v.ApartamentoId, v.ClienteId, v.ReservaId, v.DataVenda, v.ValorVenda, v.Status.ToString()))
			.ToListAsync(ct);
}

public class ObterVendaPorIdQueryHandler(AppDbContext db)
	: IRequestHandler<ObterVendaPorIdQuery, VendaDto?>
{
	public Task<VendaDto?> Handle(ObterVendaPorIdQuery query, CancellationToken ct)
		=> db.Vendas
			.AsNoTracking()
			.Where(v => v.Id == query.Id)
			.Select(v => new VendaDto(v.Id, v.ApartamentoId, v.ClienteId, v.ReservaId, v.DataVenda, v.ValorVenda, v.Status.ToString()))
			.FirstOrDefaultAsync(ct);
}