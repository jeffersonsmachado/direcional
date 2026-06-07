using Direcional.Application.Common;
using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Clientes;

public record ClienteDto(Guid Id, string Nome, string CPF, string Email, string Telefone);

public record ObterClientesQuery(int PageNumber = 1, int PageSize = 10) : IRequest<PagedResultDto<ClienteDto>>;
public record ObterClientePorIdQuery(Guid Id) : IRequest<ClienteDto?>;

public class ObterClientesQueryHandler(AppDbContext db)
	: IRequestHandler<ObterClientesQuery, PagedResultDto<ClienteDto>>
{
	public async Task<PagedResultDto<ClienteDto>> Handle(ObterClientesQuery query, CancellationToken ct)
	{
		int pageNumber = query.PageNumber < 1 ? 1 : query.PageNumber;
		int pageSize = query.PageSize < 1 ? 10 : query.PageSize;

		var queryBase = db.Clientes.AsNoTracking();
		var totalCount = await queryBase.CountAsync(ct);

		var items = await queryBase
			.OrderBy(a => a.Nome)
			.ThenBy(a => a.Telefone)
			.Skip((pageNumber - 1) * pageSize)
			.Take(pageSize)
			.Select(c => new ClienteDto(c.Id, c.Nome, c.CPF, c.Email, c.Telefone))
			.ToListAsync(ct);

		return new PagedResultDto<ClienteDto>(items, totalCount, pageNumber, pageSize);
	}
}

public class ObterClientePorIdQueryHandler(AppDbContext db)
	: IRequestHandler<ObterClientePorIdQuery, ClienteDto?>
{
	public Task<ClienteDto?> Handle(ObterClientePorIdQuery query, CancellationToken ct)
		=> db.Clientes
			.AsNoTracking()
			.Where(c => c.Id == query.Id)
			.Select(c => new ClienteDto(c.Id, c.Nome, c.CPF, c.Email, c.Telefone))
			.FirstOrDefaultAsync(ct);
}