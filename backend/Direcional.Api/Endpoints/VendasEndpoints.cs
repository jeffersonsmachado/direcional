using Direcional.Application.Vendas;
using MediatR;

namespace Direcional.Api.Endpoints;

public static class VendasEndpoints
{
	public static void MapVendasEndpoints(this WebApplication app)
	{
		var group = app.MapGroup("/vendas").RequireAuthorization();

		group.MapGet("/", async (IMediator mediator) =>
			Results.Ok(await mediator.Send(new ObterVendasQuery())))
			.RequireAuthorization(policy => policy.RequireRole("Admin", "Corretor"));

		group.MapPost("/vendas", async (CriarVendaCommand cmd, IMediator mediator) =>
		{
			try
			{
				var id = await mediator.Send(cmd);
				return Results.Created($"/vendas/{id}", new { id });
			}
			catch (InvalidOperationException ex)
			{
				return Results.Problem(ex.Message, statusCode: 400);
			}
		}).RequireAuthorization(policy => policy.RequireRole("Admin", "Corretor"));


		group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
		{
			var venda = await mediator.Send(new ObterVendaPorIdQuery(id));
			return venda is null ? Results.NotFound() : Results.Ok(venda);
		}).RequireAuthorization(policy => policy.RequireRole("Admin", "Corretor"));

		group.MapPatch("/{id:guid}/concluir", async (Guid id, IMediator mediator) =>
		{
			try
			{
				await mediator.Send(new ConcluirVendaCommand(id));
				return Results.NoContent();
			}
			catch (InvalidOperationException ex)
			{
				return Results.Problem(ex.Message, statusCode: 400);
			}
		}).RequireAuthorization(policy => policy.RequireRole("Admin", "Corretor"));

		group.MapPatch("/{id:guid}/cancelar", async (Guid id, IMediator mediator) =>
		{
			try
			{
				await mediator.Send(new CancelarVendaCommand(id));
				return Results.NoContent();
			}
			catch (InvalidOperationException ex)
			{
				return Results.Problem(ex.Message, statusCode: 400);
			}
		}).RequireAuthorization(policy => policy.RequireRole("Admin", "Corretor"));
	}
}