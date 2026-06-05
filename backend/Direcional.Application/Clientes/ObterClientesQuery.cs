using Direcional.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Application.Clientes;

public record ClienteDto(Guid Id, string Nome, string CPF, string Email, string Telefone);

public record ObterClientesQuery() : IRequest<List<ClienteDto>>;
public record ObterClientePorIdQuery(Guid Id) : IRequest<ClienteDto?>;

public class ObterClientesQueryHandler(AppDbContext db)
	: IRequestHandler<ObterClientesQuery, List<ClienteDto>>
{
	public Task<List<ClienteDto>> Handle(ObterClientesQuery query, CancellationToken ct)
		=> db.Clientes
			.AsNoTracking()
			.Select(c => new ClienteDto(c.Id, c.Nome, c.CPF, c.Email, c.Telefone))
			.ToListAsync(ct);
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