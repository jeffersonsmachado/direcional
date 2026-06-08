using Direcional.Domain.Aggregates.Apartamentos;
using Direcional.Domain.Aggregates.Clientes;
using Direcional.Domain.Aggregates.Usuarios;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Infrastructure.Persistence;

public static class DbSeeder
{
	public static async Task SeedAsync(AppDbContext db)
	{
		if (await db.Perfis.AnyAsync()) return;

		// ── PERFIS ────────────────────────────────────────────────
		var admin = Perfil.Criar("Admin");
		var corretor = Perfil.Criar("Corretor");
		var comum = Perfil.Criar("Comum");

		db.Perfis.AddRange(admin, corretor, comum);
		await db.SaveChangesAsync();

		// ── USUÁRIOS ──────────────────────────────────────────────
		var hashAdmin = BCrypt.Net.BCrypt.HashPassword("Admin@123");
		var hashCorretor = BCrypt.Net.BCrypt.HashPassword("Corretor@123");
		var hashComum = BCrypt.Net.BCrypt.HashPassword("Comum@123");

		// var userAdmin = new Usuario("Admin do Sistema", "admin@direcional.com", "senhaSegura123", perfilAdmin.Id);

		db.Usuarios.AddRange(
			Usuario.Criar("Administrador", "admin@direcional.com", hashAdmin, admin.Id),
			Usuario.Criar("Carlos Corretor", "corretor@direcional.com", hashCorretor, corretor.Id),
			Usuario.Criar("Maria Comum", "comum@direcional.com", hashComum, comum.Id)
		);
		await db.SaveChangesAsync();

		// ── CLIENTES ──────────────────────────────────────────────
		var cliente1 = Cliente.Criar("Ana Souza", "111.111.111-11", "ana@email.com", "(11) 91111-1111");
		var cliente2 = Cliente.Criar("Bruno Lima", "222.222.222-22", "bruno@email.com", "(11) 92222-2222");
		var cliente3 = Cliente.Criar("Carla Mendes", "333.333.333-33", "carla@email.com", "(11) 93333-3333");

		db.Clientes.AddRange(cliente1, cliente2, cliente3);
		await db.SaveChangesAsync();

		// ── APARTAMENTOS ──────────────────────────────────────────
		var apto1 = Apartamento.Criar("101", "A", 1, 48.5m, 350_000m);
		var apto2 = Apartamento.Criar("202", "A", 2, 65.0m, 480_000m);
		var apto3 = Apartamento.Criar("303", "B", 3, 90.0m, 720_000m);
		var apto4 = Apartamento.Criar("104", "B", 1, 48.5m, 355_000m);
		var apto5 = Apartamento.Criar("205", "C", 2, 65.0m, 490_000m);
		var apto6 = Apartamento.Criar("401", "C", 4, 75.0m, 580_000m); // disponível
		var apto7 = Apartamento.Criar("502", "D", 5, 110.0m, 890_000m); // disponível

		db.Apartamentos.AddRange(apto1, apto2, apto3, apto4, apto5, apto6, apto7);
		await db.SaveChangesAsync();
	}
}