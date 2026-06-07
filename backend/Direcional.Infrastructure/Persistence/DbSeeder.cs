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

		// ── RESERVAS (3 exemplos) ─────────────────────────────────
		// apto4 e apto5 ficam reservados
		apto4.MarcarComoReservado();
		apto5.MarcarComoReservado();

		var reserva1 = Reserva.Criar(apto4.Id, cliente1.Id, 30, "Reserva para avaliação do imóvel");
		var reserva2 = Reserva.Criar(apto5.Id, cliente2.Id, 15, "Cliente retorna em 15 dias");
		var reserva3 = Reserva.Criar(apto3.Id, cliente3.Id, 30, "Aguardando aprovação de financiamento");

		// reserva3: apto3 também reservado
		apto3.MarcarComoReservado();

		db.Reservas.AddRange(reserva1, reserva2, reserva3);
		await db.SaveChangesAsync();

		// ── VENDAS (3 exemplos) ───────────────────────────────────
		// apto1 e apto2 são vendidos diretamente (sem reserva prévia)
		// apto3 é vendido convertendo a reserva3
		apto1.MarcarComoVendido();
		apto2.MarcarComoVendido();
		apto3.MarcarComoVendido();
		reserva3.Converter();

		var venda1 = Venda.Criar(apto1.Id, cliente1.Id, 350_000m);
		var venda2 = Venda.Criar(apto2.Id, cliente2.Id, 475_000m);
		var venda3 = Venda.Criar(apto3.Id, cliente3.Id, 715_000m, reserva3.Id);

		venda1.Concluir();
		venda2.Concluir();
		// venda3 fica EmAndamento

		db.Vendas.AddRange(venda1, venda2, venda3);
		await db.SaveChangesAsync();
	}
}