using Direcional.Application.Common;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Reservas;

public record ReservaClienteDto(Guid Id, string Nome, string CPF);
public record ReservaApartamentoDto(Guid Id, string Numero, string Bloco, int Andar, decimal Valor);

public record ReservaDto(
	Guid Id,
	Guid ApartamentoId,
	Guid ClienteId,
	DateTime DataReserva,
	DateTime DataExpiracao,
	string Status,
	string? Observacoes,
	string ClienteNome,       // Adicionado
	string ApartamentoNumero, // Adicionado
	string Bloco              // Adicionado
	);

public record ReservaDetalheDto(
	Guid Id,
	DateTime DataReserva,
	DateTime DataExpiracao,
	string Status,
	string? Observacoes,
	string? ClienteNome,
	string? ClienteCpf,
	string? ApartamentoNumero,
	string? Bloco,
	int? Andar,
	decimal? ValorApartamento,
	ReservaClienteDto? Cliente,
	ReservaApartamentoDto? Apartamento);

public record ObterReservasQuery(int PageNumber = 1, int PageSize = 10) : IRequest<PagedResultDto<ReservaDto>>;
public record ObterReservaPorIdQuery(Guid Id) : IRequest<ReservaDetalheDto?>;

public class ObterReservasQueryHandler(AppDbContext db)
	: IRequestHandler<ObterReservasQuery, PagedResultDto<ReservaDto>>
{
	public async Task<PagedResultDto<ReservaDto>> Handle(ObterReservasQuery query, CancellationToken ct)
	{
		int pageNumber = query.PageNumber < 1 ? 1 : query.PageNumber;
		int pageSize = query.PageSize < 1 ? 10 : query.PageSize;

		var queryBase = db.Reservas.AsNoTracking();
		var totalCount = await queryBase.CountAsync(ct);

		var items = await queryBase
			.OrderBy(a => a.DataReserva)
			.ThenBy(a => a.Status)
			.Skip((pageNumber - 1) * pageSize)
			.Take(pageSize)
			.Join(db.Clientes, r => r.ClienteId, c => c.Id, (r, c) => new { r, c })
			.Join(db.Apartamentos, rc => rc.r.ApartamentoId, a => a.Id, (rc, a) => new { rc.r, rc.c, a })
			.Select(x => new ReservaDto(
				x.r.Id,
				x.r.ApartamentoId,
				x.r.ClienteId,
				x.r.DataReserva,
				x.r.DataExpiracao,
				x.r.Status.ToString(),
				x.r.Observacoes,
				x.c.Nome,
				x.a.Numero,
				x.a.Bloco
			))
			.ToListAsync(ct);
		return new PagedResultDto<ReservaDto>(items, totalCount, pageNumber, pageSize);
	}
}

public class ObterReservaPorIdQueryHandler(AppDbContext db)
	: IRequestHandler<ObterReservaPorIdQuery, ReservaDetalheDto?>
{
	public Task<ReservaDetalheDto?> Handle(ObterReservaPorIdQuery query, CancellationToken ct)
		=> (from r in db.Reservas.AsNoTracking()
			join c in db.Clientes.AsNoTracking() on r.ClienteId equals c.Id
			join a in db.Apartamentos.AsNoTracking() on r.ApartamentoId equals a.Id
			where r.Id == query.Id
			select new ReservaDetalheDto(
				r.Id,
				r.DataReserva,
				r.DataExpiracao,
				r.Status.ToString(),
				r.Observacoes,
				c.Nome,
				c.CPF,
				a.Numero,
				a.Bloco,
				a.Andar,
				a.Valor,
				new ReservaClienteDto(c.Id, c.Nome, c.CPF),
				new ReservaApartamentoDto(a.Id, a.Numero, a.Bloco, a.Andar, a.Valor)
			)).FirstOrDefaultAsync(ct);
}