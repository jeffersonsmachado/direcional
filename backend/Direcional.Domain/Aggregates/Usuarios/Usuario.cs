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

	public Usuario(string nome, string email, string senhaTextoPuro, Guid perfilId)
	{
		Id = Guid.NewGuid();
		Nome = nome;
		Email = email;
		PerfilId = perfilId;

		// Ao criar o usuário, criptografamos a senha fornecida pelo Admin
		DefinirSenha(senhaTextoPuro);
	}

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

	public void DefinirSenha(string senhaTextoPuro)
	{
		if (string.IsNullOrWhiteSpace(senhaTextoPuro))
			throw new ArgumentException("A senha não pode estar em branco.");

		SenhaHash = BCrypt.Net.BCrypt.HashPassword(senhaTextoPuro);
	}

	public bool VerificarSenha(string senhaDigitada)
	{
		if (string.IsNullOrWhiteSpace(senhaDigitada) || string.IsNullOrWhiteSpace(SenhaHash))
			return false;

		return BCrypt.Net.BCrypt.Verify(senhaDigitada, SenhaHash);
	}
}