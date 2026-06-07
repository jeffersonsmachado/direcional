using Direcional.Domain.Aggregates.Apartamentos;
using Direcional.Domain.Aggregates.Clientes;
using Direcional.Domain.Aggregates.Usuarios;
using Microsoft.EntityFrameworkCore;

namespace Direcional.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
	public DbSet<Apartamento> Apartamentos => Set<Apartamento>();
	public DbSet<Reserva> Reservas => Set<Reserva>();
	public DbSet<Venda> Vendas => Set<Venda>();
	public DbSet<Cliente> Clientes => Set<Cliente>();
	public DbSet<Usuario> Usuarios => Set<Usuario>();
	public DbSet<Perfil> Perfis => Set<Perfil>();

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		// APARTAMENTO
		modelBuilder.Entity<Apartamento>()
			.HasKey(a => a.Id);
		modelBuilder.Entity<Apartamento>()
			.Property(a => a.Area)
			.HasPrecision(18, 2);
		modelBuilder.Entity<Apartamento>()
			.Property(a => a.Valor)
			.HasPrecision(18, 2);
		modelBuilder.Entity<Apartamento>()
			.Property(a => a.Numero)
			.HasMaxLength(20);
		modelBuilder.Entity<Apartamento>()
			.Property(a => a.Bloco)
			.HasMaxLength(10);


		// RESERVA
		modelBuilder.Entity<Reserva>()
			.HasKey(r => r.Id);
		modelBuilder.Entity<Reserva>()
			.HasOne<Apartamento>()
			.WithMany()
			.HasForeignKey(r => r.ApartamentoId)
			.OnDelete(DeleteBehavior.Restrict);
		modelBuilder.Entity<Reserva>()
			.HasOne<Cliente>()
			.WithMany()
			.HasForeignKey(r => r.ClienteId)
			.OnDelete(DeleteBehavior.Restrict);


		// VENDA
		modelBuilder.Entity<Venda>()
			.HasKey(v => v.Id);
		modelBuilder.Entity<Venda>()
			.Property(v => v.ValorVenda)
			.HasPrecision(18, 2);
		modelBuilder.Entity<Venda>()
			.HasOne<Apartamento>()
			.WithMany()
			.HasForeignKey(v => v.ApartamentoId)
			.OnDelete(DeleteBehavior.Restrict);
		modelBuilder.Entity<Venda>()
			.HasOne<Cliente>()
			.WithMany()
			.HasForeignKey(v => v.ClienteId)
			.OnDelete(DeleteBehavior.Restrict);
		modelBuilder.Entity<Venda>()
			.HasOne<Reserva>()
			.WithMany()
			.HasForeignKey(v => v.ReservaId)
			.OnDelete(DeleteBehavior.Restrict);


		// CLIENTE
		modelBuilder.Entity<Cliente>()
			.HasKey(c => c.Id);
		modelBuilder.Entity<Cliente>()
			.Property(c => c.Nome)
			.HasMaxLength(200);
		modelBuilder.Entity<Cliente>()
			.Property(c => c.CPF)
			.HasMaxLength(14);
		modelBuilder.Entity<Cliente>()
			.Property(c => c.Email)
			.HasMaxLength(200);
		modelBuilder.Entity<Cliente>()
			.Property(c => c.Telefone)
			.HasMaxLength(20);
		modelBuilder.Entity<Cliente>()
			.HasIndex(c => c.CPF)
			.IsUnique();
		modelBuilder.Entity<Cliente>()
			.HasIndex(c => c.Email)
			.IsUnique();


		// USUARIO
		modelBuilder.Entity<Usuario>()
			.HasKey(u => u.Id);
		modelBuilder.Entity<Usuario>()
			.Property(u => u.Nome)
			.HasMaxLength(200);
		modelBuilder.Entity<Usuario>()
			.Property(u => u.Email)
			.HasMaxLength(200);
		modelBuilder.Entity<Usuario>()
			.Property(u => u.SenhaHash)
			.HasMaxLength(128);
		modelBuilder.Entity<Usuario>()
			.HasIndex(u => u.Email)
			.IsUnique();
		modelBuilder.Entity<Usuario>()
			.HasOne(u => u.Perfil)
			.WithMany()
			.HasForeignKey(u => u.PerfilId)
			.OnDelete(DeleteBehavior.Restrict);

		// PERFIL
		modelBuilder.Entity<Perfil>()
			.HasKey(p => p.Id);
		modelBuilder.Entity<Perfil>()
			.Property(p => p.Nome)
			.HasMaxLength(100);
		modelBuilder.Entity<Perfil>()
			.HasIndex(p => p.Nome)
			.IsUnique();

	}
}