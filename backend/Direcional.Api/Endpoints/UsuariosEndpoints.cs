using Direcional.Application.Usuarios;
using MediatR;

namespace Direcional.Api.Endpoints;

public static class UsuariosEndpoints
{
	public static void MapUsuariosEndpoints(this WebApplication app)
	{
		app.MapPost("/auth/login", async (LoginCommand cmd, IMediator mediator) =>
		{
			try
			{
				var token = await mediator.Send(cmd);
				return Results.Ok(new { token });
			}
			catch (UnauthorizedAccessException)
			{
				return Results.Unauthorized();
			}
		}).AllowAnonymous();

		app.MapPost("/usuarios", async (CriarUsuarioCommand cmd, IMediator mediator) =>
		{
			var id = await mediator.Send(cmd);
			return Results.Created($"/usuarios/{id}", new { id });
		}).RequireAuthorization("Admin");

		app.MapGet("/usuarios", async (IMediator mediator) =>
			Results.Ok(await mediator.Send(new ObterUsuariosQuery())))
			.RequireAuthorization();

		app.MapGet("/usuarios/{id:guid}", async (Guid id, IMediator mediator) =>
		{
			var usuario = await mediator.Send(new ObterUsuarioPorIdQuery(id));
			return usuario is null ? Results.NotFound() : Results.Ok(usuario);
		}).RequireAuthorization();
	}
}