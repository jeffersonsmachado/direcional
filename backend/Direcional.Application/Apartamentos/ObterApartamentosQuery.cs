using Direcional.Application.Common;
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

public record ObterApartamentosQuery(int PageNumber = 1, int PageSize = 10) : IRequest<PagedResultDto<ApartamentoDto>>;
public record ObterApartamentosDisponiveisQuery(int PageNumber = 1, int PageSize = 10) : IRequest<PagedResultDto<ApartamentoDto>>;
public record ObterApartamentoPorIdQuery(Guid Id) : IRequest<ApartamentoDto?>;

public class ObterApartamentosQueryHandler(AppDbContext db)
	: IRequestHandler<ObterApartamentosQuery, PagedResultDto<ApartamentoDto>>
{
	public async Task<PagedResultDto<ApartamentoDto>> Handle(ObterApartamentosQuery query, CancellationToken ct)
	{
		int pageNumber = query.PageNumber < 1 ? 1 : query.PageNumber;
		int pageSize = query.PageSize < 1 ? 10 : query.PageSize;

		var queryBase = db.Apartamentos.AsNoTracking();
		var totalCount = await queryBase.CountAsync(ct);

		var items = await queryBase
			.OrderBy(a => a.Bloco)
			.ThenBy(a => a.Numero)
			.Skip((pageNumber - 1) * pageSize)
			.Take(pageSize)
			.Select(a => new ApartamentoDto(
				a.Id,
				a.Numero,
				a.Bloco,
				a.Andar,
				a.Area,
				a.Valor,
				a.Status.ToString()))
			.ToListAsync(ct);

		return new PagedResultDto<ApartamentoDto>(items, totalCount, pageNumber, pageSize);
	}
}
public class ObterApartamentosDisponiveisQueryHandler(AppDbContext db)
	: IRequestHandler<ObterApartamentosDisponiveisQuery, PagedResultDto<ApartamentoDto>>
{
	public async Task<PagedResultDto<ApartamentoDto>> Handle(ObterApartamentosDisponiveisQuery query, CancellationToken ct)
	{
		int pageNumber = query.PageNumber < 1 ? 1 : query.PageNumber;
		int pageSize = query.PageSize < 1 ? 10 : query.PageSize;

		var queryBase = db.Apartamentos.AsNoTracking();
		var totalCount = await queryBase.Where(a => a.Status == StatusApartamento.Disponivel).CountAsync(ct);

		var items = await queryBase
			.Where(a => a.Status == StatusApartamento.Disponivel)
			.OrderBy(a => a.Bloco)
			.ThenBy(a => a.Numero)
			.Skip((pageNumber - 1) * pageSize)
			.Take(pageSize)
			.Select(a => new ApartamentoDto(
				a.Id,
				a.Numero,
				a.Bloco,
				a.Andar,
				a.Area,
				a.Valor,
				a.Status.ToString()))
			.ToListAsync(ct);

		return new PagedResultDto<ApartamentoDto>(items, totalCount, pageNumber, pageSize);
	}
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