using Direcional.Application.Clientes;
using MediatR;

namespace Direcional.Api.Endpoints;

public static class ClientesEndpoints
{
	public static void MapClientesEndpoints(this WebApplication app)
	{
		var group = app.MapGroup("/clientes").RequireAuthorization(policy => policy.RequireRole("Admin", "Corretor"));

		group.MapGet("/", async (IMediator mediator, int? pageNumber, int? pageSize) =>
		{
			var query = new ObterClientesQuery(pageNumber ?? 1, pageSize ?? 10);

			var result = await mediator.Send(query);

			return Results.Ok(result);
		});

		group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
		{
			var cliente = await mediator.Send(new ObterClientePorIdQuery(id));
			return cliente is null ? Results.NotFound() : Results.Ok(cliente);
		});

		group.MapPost("/", async (CriarClienteCommand cmd, IMediator mediator) =>
		{
			var id = await mediator.Send(cmd);
			return Results.Created($"/clientes/{id}", new { id });
		});

		group.MapPut("/{id:guid}", async (Guid id, AtualizarClienteCommand cmd, IMediator mediator) =>
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
		});

		group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
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
		});
	}
}