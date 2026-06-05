using Direcional.Domain.Aggregates.Usuarios;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Infrastructure.Persistence;

public static class DbSeeder
{
	public static async Task SeedAsync(AppDbContext db)
	{
		if (await db.Permissoes.AnyAsync()) return;

		var permissoes = new[]
		{
			Permissao.Criar(Permissoes.ApartamentosGerenciar, "Criar e editar apartamentos"),
			Permissao.Criar(Permissoes.ReservasGerenciar,     "Criar e cancelar reservas"),
			Permissao.Criar(Permissoes.VendasGerenciar,       "Criar e cancelar vendas"),
			Permissao.Criar(Permissoes.ClientesGerenciar,     "Criar e editar clientes"),
			Permissao.Criar(Permissoes.UsuariosGerenciar,     "Criar e editar usuários"),
			Permissao.Criar(Permissoes.RelatoriosVisualizar,  "Visualizar relatórios"),
		};

		db.Permissoes.AddRange(permissoes);

		var admin = Perfil.Criar("Admin");
		var corretor = Perfil.Criar("Corretor");

		db.Perfis.Add(admin);
		db.Perfis.Add(corretor);

		await db.SaveChangesAsync();

		// Admin tem tudo
		foreach (var p in permissoes)
			db.PerfilPermissoes.Add(PerfilPermissao.Criar(admin.Id, p.Id));

		// Corretor tem subset
		var corretorPermissoes = permissoes.Where(p =>
			p.Chave == Permissoes.ApartamentosGerenciar ||
			p.Chave == Permissoes.ReservasGerenciar ||
			p.Chave == Permissoes.VendasGerenciar ||
			p.Chave == Permissoes.ClientesGerenciar ||
			p.Chave == Permissoes.RelatoriosVisualizar);

		foreach (var p in corretorPermissoes)
			db.PerfilPermissoes.Add(PerfilPermissao.Criar(corretor.Id, p.Id));

		await db.SaveChangesAsync();

		// Usuário admin padrão
		var senhaHash = BCrypt.Net.BCrypt.HashPassword("secret123");
		var usuarioAdmin = Usuario.Criar("Administrador", "admin@mail.com", senhaHash, admin.Id);
		db.Usuarios.Add(usuarioAdmin);

		await db.SaveChangesAsync();
	}
}