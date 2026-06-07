using Direcional.Application.Apartamentos;
using MediatR;

namespace Direcional.Api.Endpoints;

public static class ApartamentosEndpoints
{
	public static void MapApartamentosEndpoints(this WebApplication app)
	{
		app.MapGet("/apartamentos", async (IMediator mediator) =>
			Results.Ok(await mediator.Send(new ObterApartamentosQuery())))
			.RequireAuthorization();

		app.MapGet("/apartamentos/{id:guid}", async (Guid id, IMediator mediator) =>
		{
			var apartamento = await mediator.Send(new ObterApartamentoPorIdQuery(id));
			return apartamento is null ? Results.NotFound() : Results.Ok(apartamento);
		}).RequireAuthorization();

		app.MapPost("/apartamentos", async (CriarApartamentoCommand cmd, IMediator mediator) =>
		{
			var id = await mediator.Send(cmd);
			return Results.Created($"/apartamentos/{id}", new { id });
		}).RequireAuthorization(policy => policy.RequireRole("Admin", "Corretor"));

		app.MapPut("/apartamentos/{id:guid}", async (Guid id, AtualizarApartamentoCommand cmd, IMediator mediator) =>
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
		}).RequireAuthorization(policy => policy.RequireRole("Admin", "Corretor"));

		app.MapPatch("/apartamentos/{id:guid}/valor", async (Guid id, AtualizarValorRequest req, IMediator mediator) =>
		{
			try
			{
				await mediator.Send(new AtualizarValorApartamentoCommand(id, req.Valor));
				return Results.NoContent();
			}
			catch (InvalidOperationException ex)
			{
				return Results.Problem(ex.Message, statusCode: 400);
			}
		}).RequireAuthorization(policy => policy.RequireRole("Admin", "Corretor"));

		app.MapDelete("/apartamentos/{id:guid}", async (Guid id, IMediator mediator) =>
		{
			try
			{
				await mediator.Send(new ExcluirApartamentoCommand(id));
				return Results.NoContent();
			}
			catch (InvalidOperationException ex)
			{
				return Results.Problem(ex.Message, statusCode: 400);
			}
		}).RequireAuthorization(policy => policy.RequireRole("Admin", "Corretor"));
	}
}