using Direcional.Application.Apartamentos;
using MediatR;

namespace Direcional.Api.Endpoints;

public static class ApartamentosEndpoints
{
	public static void MapApartamentosEndpoints(this WebApplication app)
	{
		app.MapPost("/apartamentos", async (CriarApartamentoCommand cmd, IMediator mediator) =>
		{
			var id = await mediator.Send(cmd);
			return Results.Created($"/apartamentos/{id}", new { id });
		});

		app.MapGet("/apartamentos", async (IMediator mediator) =>
			Results.Ok(await mediator.Send(new ObterApartamentosQuery())));

		app.MapGet("/apartamentos/{id:guid}", async (Guid id, IMediator mediator) =>
		{
			var apartamento = await mediator.Send(new ObterApartamentoPorIdQuery(id));
			return apartamento is null ? Results.NotFound() : Results.Ok(apartamento);
		});
	}
}