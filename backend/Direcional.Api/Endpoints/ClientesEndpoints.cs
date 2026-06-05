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
		}).RequireAuthorization();

		app.MapGet("/clientes", async (IMediator mediator) =>
			Results.Ok(await mediator.Send(new ObterClientesQuery())))
			.RequireAuthorization();

		app.MapGet("/clientes/{id:guid}", async (Guid id, IMediator mediator) =>
		{
			var cliente = await mediator.Send(new ObterClientePorIdQuery(id));
			return cliente is null ? Results.NotFound() : Results.Ok(cliente);
		}).RequireAuthorization();

		app.MapPut("/clientes/{id:guid}", async (Guid id, AtualizarClienteCommand cmd, IMediator mediator) =>
		{
			if (id != cmd.Id) return Results.BadRequest("ID da rota não corresponde ao corpo.");
			try
			{
				await mediator.Send(cmd);
				return Results.NoContent();
			}
			catch (InvalidOperationException ex)
			{
				return Results.Problem(ex.Message, statusCode: 400);
			}
		}).RequireAuthorization();

		app.MapDelete("/clientes/{id:guid}", async (Guid id, IMediator mediator) =>
		{
			try
			{
				await mediator.Send(new ExcluirClienteCommand(id));
				return Results.NoContent();
			}
			catch (InvalidOperationException ex)
			{
				return Results.Problem(ex.Message, statusCode: 400);
			}
		}).RequireAuthorization();
	}
}