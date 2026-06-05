using Direcional.Application.Reservas;
using MediatR;

namespace Direcional.Api.Endpoints;

public static class ReservasEndpoints
{
	public static void MapReservasEndpoints(this WebApplication app)
	{
		app.MapPost("/reservas", async (CriarReservaCommand cmd, IMediator mediator) =>
		{
			var id = await mediator.Send(cmd);
			return Results.Created($"/reservas/{id}", new { id });
		});

		app.MapGet("/reservas", async (IMediator mediator) =>
			Results.Ok(await mediator.Send(new ObterReservasQuery())));

		app.MapGet("/reservas/{id:guid}", async (Guid id, IMediator mediator) =>
		{
			var reserva = await mediator.Send(new ObterReservaPorIdQuery(id));
			return reserva is null ? Results.NotFound() : Results.Ok(reserva);
		});
	}
}