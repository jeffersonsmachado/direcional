using System.Text;
using Direcional.Api.Endpoints;
using Direcional.Application.Apartamentos;
using Direcional.Domain.Aggregates.Usuarios;
using Direcional.Domain.Interfaces;
using Direcional.Infrastructure.Auth;
using Direcional.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(opt =>
	opt.UseSqlServer(
		builder.Configuration.GetConnectionString("DefaultConnection"),
		sql => sql.EnableRetryOnFailure(
			maxRetryCount: 5,
			maxRetryDelay: TimeSpan.FromSeconds(10),
			errorNumbersToAdd: null)));

builder.Services.AddMediatR(cfg =>
	cfg.RegisterServicesFromAssembly(typeof(CriarApartamentoCommand).Assembly));

builder.Services.AddScoped<IJwtService, JwtService>();

var jwtChave = builder.Configuration["Jwt:Chave"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
	.AddJwtBearer(opt =>
	{
		opt.TokenValidationParameters = new TokenValidationParameters
		{
			ValidateIssuer = true,
			ValidateAudience = true,
			ValidateLifetime = true,
			ValidateIssuerSigningKey = true,
			ValidIssuer = builder.Configuration["Jwt:Emissor"],
			ValidAudience = builder.Configuration["Jwt:Audiencia"],
			IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtChave))
		};
	});

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opt =>
{
	opt.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
	{
		Name = "Authorization",
		Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
		Scheme = "Bearer",
		BearerFormat = "JWT",
		In = Microsoft.OpenApi.Models.ParameterLocation.Header
	});
	opt.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
	{
		{
			new Microsoft.OpenApi.Models.OpenApiSecurityScheme
			{
				Reference = new Microsoft.OpenApi.Models.OpenApiReference
				{
					Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
					Id = "Bearer"
				}
			},
			Array.Empty<string>()
		}
	});
});

builder.Services.AddAuthorizationBuilder()
	.AddPolicy("GerenciarUsuarios", policy =>
		policy.RequireClaim("permissao", Permissoes.UsuariosGerenciar));

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapApartamentosEndpoints();
app.MapReservasEndpoints();
app.MapVendasEndpoints();
app.MapClientesEndpoints();
app.MapUsuariosEndpoints();
app.MapPerfisEndpoints();

using (var scope = app.Services.CreateScope())
{
	var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

	for (int i = 0; i < 5; i++)
	{
		try
		{
			db.Database.Migrate();
			await DbSeeder.SeedAsync(db);
			break;
		}
		catch (Exception)
		{
			if (i == 4) throw;
			await Task.Delay(TimeSpan.FromSeconds(10));
		}
	}
}

app.Run();