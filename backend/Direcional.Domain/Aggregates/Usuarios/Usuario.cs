namespace Direcional.Domain.Aggregates.Usuarios;

public enum PerfilUsuario { Admin, Corretor }

public class Usuario
{
	public Guid Id { get; private set; }
	public string Nome { get; private set; } = string.Empty;
	public string Email { get; private set; } = string.Empty;
	public string SenhaHash { get; private set; } = string.Empty;
	public Guid PerfilId { get; private set; }
	public Perfil Perfil { get; private set; } = null!;

	private Usuario() { }

	public static Usuario Criar(string nome, string email, string senhaHash, Guid perfilId)
	{
		return new Usuario
		{
			Id = Guid.NewGuid(),
			Nome = nome,
			Email = email,
			SenhaHash = senhaHash,
			PerfilId = perfilId
		};
	}
}