using Direcional.Application.Usuarios;
using MediatR;

namespace Direcional.Api.Endpoints;

public static class UsuariosEndpoints
{
	public static void MapUsuariosEndpoints(this WebApplication app)
	{

		app.MapGet("/usuarios", async (IMediator mediator, int? pageNumber, int? pageSize) =>
		{
			var query = new ObterUsuariosQuery(pageNumber ?? 1, pageSize ?? 10);

			var result = await mediator.Send(query);

			return Results.Ok(result);


		}).RequireAuthorization(policy => policy.RequireRole("Admin"));

		app.MapGet("/usuarios/{id:guid}", async (Guid id, IMediator mediator) =>
		{
			var usuario = await mediator.Send(new ObterUsuarioPorIdQuery(id));
			return usuario is null ? Results.NotFound() : Results.Ok(usuario);
		}).RequireAuthorization();

		app.MapPost("/usuarios/auth/login", async (LoginCommand cmd, IMediator mediator) =>
		{
			try
			{
				var token = await mediator.Send(cmd);
				return Results.Ok(new { token });
			}
			catch (Exception ex)
			{
				return Results.BadRequest(new { message = ex.Message });
			}
		}).AllowAnonymous();

		app.MapPost("/usuarios", async (CriarUsuarioCommand cmd, IMediator mediator) =>
		{
			var id = await mediator.Send(cmd);
			return Results.Created($"/usuarios/{id}", new { id });
		}).RequireAuthorization(policy => policy.RequireRole("Admin"));

		app.MapPut("/usuarios/{id:guid}", async (Guid id, AtualizarUsuarioCommand cmd, IMediator mediator) =>
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
		}).RequireAuthorization(policy => policy.RequireRole("Admin"));

		app.MapPatch("/usuarios/{id:guid}/senha", async (Guid id, AlterarSenhaRequest req, IMediator mediator) =>
		{
			try
			{
				await mediator.Send(new AlterarSenhaCommand(id, req.SenhaAtual, req.NovaSenha));
				return Results.NoContent();
			}
			catch (UnauthorizedAccessException)
			{
				return Results.Unauthorized();
			}
			catch (InvalidOperationException)
			{
				return Results.NotFound();
			}
		}).RequireAuthorization(policy => policy.RequireRole("Admin", "Corretor"));

		app.MapDelete("/usuarios/{id:guid}", async (Guid id, IMediator mediator) =>
		{
			try
			{
				await mediator.Send(new ExcluirUsuarioCommand(id));
				return Results.NoContent();
			}
			catch (InvalidOperationException)
			{
				return Results.NotFound();
			}
		}).RequireAuthorization(policy => policy.RequireRole("Admin"));

		app.MapPatch("/usuarios/{id:guid}/perfil", async (Guid id, TrocarPerfilRequest req, IMediator mediator) =>
		{
			try
			{
				await mediator.Send(new TrocarPerfilUsuarioCommand(id, req.PerfilId));
				return Results.NoContent();
			}
			catch (InvalidOperationException ex)
			{
				return Results.Problem(ex.Message, statusCode: 400);
			}
		}).RequireAuthorization(policy => policy.RequireRole("Admin"));
	}
}