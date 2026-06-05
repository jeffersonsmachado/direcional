using Direcional.Application.Reservas;
using MediatR;

namespace Direcional.Api.Endpoints;

public static class ReservasEndpoints
{
	public static void MapReservasEndpoints(this WebApplication app)
	{
		app.MapPost("/reservas", async (CriarReservaCommand cmd, IMediator mediator) =>
		{
			try
			{
				var id = await mediator.Send(cmd);
				return Results.Created($"/reservas/{id}", new { id });
			}
			catch (InvalidOperationException ex)
			{
				return Results.Problem(ex.Message, statusCode: 400);
			}
		}).RequireAuthorization();

		app.MapGet("/reservas", async (IMediator mediator) =>
			Results.Ok(await mediator.Send(new ObterReservasQuery())))
			.RequireAuthorization();

		app.MapGet("/reservas/{id:guid}", async (Guid id, IMediator mediator) =>
		{
			var reserva = await mediator.Send(new ObterReservaPorIdQuery(id));
			return reserva is null ? Results.NotFound() : Results.Ok(reserva);
		}).RequireAuthorization();

		app.MapPatch("/reservas/{id:guid}/cancelar", async (Guid id, IMediator mediator) =>
		{
			try
			{
				await mediator.Send(new CancelarReservaCommand(id));
				return Results.NoContent();
			}
			catch (InvalidOperationException ex)
			{
				return Results.Problem(ex.Message, statusCode: 400);
			}
		}).RequireAuthorization();

		app.MapPatch("/reservas/{id:guid}/observacoes", async (Guid id, AtualizarObservacoesRequest req, IMediator mediator) =>
		{
			try
			{
				await mediator.Send(new AtualizarObservacoesReservaCommand(id, req.Observacoes));
				return Results.NoContent();
			}
			catch (InvalidOperationException ex)
			{
				return Results.Problem(ex.Message, statusCode: 400);
			}
		}).RequireAuthorization();
	}
}