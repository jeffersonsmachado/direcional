using Direcional.Application.Clientes;
using MediatR;

namespace Direcional.Api.Endpoints;

public static class ClientesEndpoints
{
	public static void MapClientesEndpoints(this WebApplication app)
	{
		app.MapPost("/clientes", async (CriarClienteCommand cmd, IMediator mediator) =>
		{
			var id = await mediator.Send(cmd);
			return Results.Created($"/clientes/{id}", new { id });
		});

		app.MapGet("/clientes", async (IMediator mediator) =>
			Results.Ok(await mediator.Send(new ObterClientesQuery())));

		app.MapGet("/clientes/{id:guid}", async (Guid id, IMediator mediator) =>
		{
			var cliente = await mediator.Send(new ObterClientePorIdQuery(id));
			return cliente is null ? Results.NotFound() : Results.Ok(cliente);
		});
	}
}