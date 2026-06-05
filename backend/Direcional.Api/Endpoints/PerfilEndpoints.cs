using Direcional.Application.Usuarios;
using MediatR;

namespace Direcional.Api.Endpoints;

public static class PerfisEndpoints
{
	public static void MapPerfisEndpoints(this WebApplication app)
	{
		app.MapGet("/perfis", async (IMediator mediator) =>
			Results.Ok(await mediator.Send(new ObterPerfisQuery())))
			.RequireAuthorization();

		app.MapGet("/perfis/{id:guid}", async (Guid id, IMediator mediator) =>
		{
			var perfil = await mediator.Send(new ObterPerfilPorIdQuery(id));
			return perfil is null ? Results.NotFound() : Results.Ok(perfil);
		}).RequireAuthorization();

		app.MapPost("/perfis", async (CriarPerfilCommand cmd, IMediator mediator) =>
		{
			var id = await mediator.Send(cmd);
			return Results.Created($"/perfis/{id}", new { id });
		}).RequireAuthorization();

		app.MapPost("/perfis/{perfilId:guid}/permissoes/{permissaoId:guid}", async (Guid perfilId, Guid permissaoId, IMediator mediator) =>
		{
			await mediator.Send(new AssociarPermissaoCommand(perfilId, permissaoId));
			return Results.NoContent();
		}).RequireAuthorization();

		app.MapDelete("/perfis/{perfilId:guid}/permissoes/{permissaoId:guid}", async (Guid perfilId, Guid permissaoId, IMediator mediator) =>
		{
			await mediator.Send(new RemoverPermissaoCommand(perfilId, permissaoId));
			return Results.NoContent();
		}).RequireAuthorization();

		app.MapGet("/permissoes", async (IMediator mediator) =>
			Results.Ok(await mediator.Send(new ObterPermissoesQuery())))
			.RequireAuthorization();

		app.MapPut("/perfis/{id:guid}", async (Guid id, AtualizarPerfilCommand cmd, IMediator mediator) =>
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
	}
}