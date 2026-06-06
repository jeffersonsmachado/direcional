using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Vendas;

public record VendaClienteDto(Guid Id, string Nome, string CPF);
public record VendaApartamentoDto(Guid Id, string Numero, string Bloco, int Andar, decimal Valor);

public record VendaDto(
	Guid Id,
	Guid ApartamentoId,
	Guid ClienteId,
	Guid? ReservaId,
	DateTime DataVenda,
	decimal ValorVenda,
	string Status,
	string ClienteNome,
	string ApartamentoNumero,
	string Bloco
);

public record VendaDetalheDto(
	Guid Id,
	Guid ApartamentoId,
	Guid ClienteId,
	Guid? ReservaId,
	DateTime DataVenda,
	decimal ValorVenda,
	string Status,
	VendaClienteDto? Cliente,
	VendaApartamentoDto Apartamento
);

public record ObterVendasQuery() : IRequest<List<VendaDto>>;
public record ObterVendaPorIdQuery(Guid Id) : IRequest<VendaDetalheDto?>;

public class ObterVendasQueryHandler(AppDbContext db)
	: IRequestHandler<ObterVendasQuery, List<VendaDto>>
{
	public Task<List<VendaDto>> Handle(ObterVendasQuery query, CancellationToken ct)
		=> db.Vendas
			.AsNoTracking()
			.Join(db.Clientes, v => v.ClienteId, c => c.Id, (v, c) => new { v, c })
			.Join(db.Apartamentos, vc => vc.v.ApartamentoId, a => a.Id, (vc, a) => new { vc.v, vc.c, a })
			.Select(x => new VendaDto(
				x.v.Id,
				x.v.ApartamentoId,
				x.v.ClienteId,
				x.v.ReservaId,
				x.v.DataVenda,
				x.v.ValorVenda,
				x.v.Status.ToString(),
				x.c.Nome,
				x.a.Numero,
				x.a.Bloco
			))
			.ToListAsync(ct);
}

public class ObterVendaPorIdQueryHandler(AppDbContext db)
	: IRequestHandler<ObterVendaPorIdQuery, VendaDetalheDto?>
{
	public Task<VendaDetalheDto?> Handle(ObterVendaPorIdQuery query, CancellationToken ct)
		=> (from v in db.Vendas.AsNoTracking()
			join c in db.Clientes.AsNoTracking() on v.ClienteId equals c.Id
			join a in db.Apartamentos.AsNoTracking() on v.ApartamentoId equals a.Id
			where v.Id == query.Id
			select new VendaDetalheDto(
				v.Id,
				v.ApartamentoId,
				v.ClienteId,
				v.ReservaId,
				v.DataVenda,
				v.ValorVenda,
				v.Status.ToString(),
				new VendaClienteDto(c.Id, c.Nome, c.CPF),
				new VendaApartamentoDto(a.Id, a.Numero, a.Bloco, a.Andar, a.Valor)
			))
			.FirstOrDefaultAsync(ct);
}