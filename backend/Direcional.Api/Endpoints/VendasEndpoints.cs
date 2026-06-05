using Direcional.Application.Vendas;
using MediatR;

namespace Direcional.Api.Endpoints;

public static class VendasEndpoints
{
	public static void MapVendasEndpoints(this WebApplication app)
	{
		app.MapPost("/vendas", async (CriarVendaCommand cmd, IMediator mediator) =>
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
		}).RequireAuthorization();

		app.MapGet("/vendas", async (IMediator mediator) =>
			Results.Ok(await mediator.Send(new ObterVendasQuery())))
			.RequireAuthorization();

		app.MapGet("/vendas/{id:guid}", async (Guid id, IMediator mediator) =>
		{
			var venda = await mediator.Send(new ObterVendaPorIdQuery(id));
			return venda is null ? Results.NotFound() : Results.Ok(venda);
		}).RequireAuthorization();

		app.MapPatch("/vendas/{id:guid}/concluir", async (Guid id, IMediator mediator) =>
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
		}).RequireAuthorization();

		app.MapPatch("/vendas/{id:guid}/cancelar", async (Guid id, IMediator mediator) =>
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
		}).RequireAuthorization();
	}
}