using Direcional.Application.Reservas;
using MediatR;

namespace Direcional.Api.Endpoints;

public static class ReservasEndpoints
{
	public static void MapReservasEndpoints(this WebApplication app)
	{
		var group = app.MapGroup("/reservas").RequireAuthorization(policy => policy.RequireRole("Admin", "Corretor")); ;


		group.MapGet("/", async (IMediator mediator, int? pageNumber, int? pageSize) =>
		{
			var query = new ObterReservasQuery(pageNumber ?? 1, pageSize ?? 10);

			var result = await mediator.Send(query);

			return Results.Ok(result);
		});

		group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
		{
			var reserva = await mediator.Send(new ObterReservaPorIdQuery(id));
			return reserva is null ? Results.NotFound() : Results.Ok(reserva);
		});

		group.MapPost("/", async (CriarReservaCommand cmd, IMediator mediator) =>
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
		});

		group.MapPatch("/{id:guid}/cancelar", async (Guid id, IMediator mediator) =>
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
		});

		group.MapPatch("/{id:guid}/observacoes", async (Guid id, AtualizarObservacoesRequest req, IMediator mediator) =>
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
		});
	}
}