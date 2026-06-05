using Direcional.Application.Vendas;
using MediatR;

namespace Direcional.Api.Endpoints;

public static class VendasEndpoints
{
	public static void MapVendasEndpoints(this WebApplication app)
	{
		app.MapPost("/vendas", async (CriarVendaCommand cmd, IMediator mediator) =>
		{
			var id = await mediator.Send(cmd);
			return Results.Created($"/vendas/{id}", new { id });
		});

		app.MapGet("/vendas", async (IMediator mediator) =>
			Results.Ok(await mediator.Send(new ObterVendasQuery())));

		app.MapGet("/vendas/{id:guid}", async (Guid id, IMediator mediator) =>
		{
			var venda = await mediator.Send(new ObterVendaPorIdQuery(id));
			return venda is null ? Results.NotFound() : Results.Ok(venda);
		});
	}
}