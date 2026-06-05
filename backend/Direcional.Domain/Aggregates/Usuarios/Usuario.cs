namespace Direcional.Domain.Aggregates.Usuarios;

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

	public void Atualizar(string nome, string email, Guid perfilId)
	{
		Nome = nome;
		Email = email;
		PerfilId = perfilId;
	}

	public void AlterarSenha(string novaSenhaHash)
	{
		SenhaHash = novaSenhaHash;
	}

	public void TrocarPerfil(Guid perfilId) => PerfilId = perfilId;
}