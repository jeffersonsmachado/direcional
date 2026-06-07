namespace Direcional.Domain.Aggregates.Usuarios;

public class Perfil
{
	public Guid Id { get; private set; }
	public string Nome { get; private set; } = string.Empty;

	private Perfil() { }

	public static Perfil Criar(string nome)
	{
		return new Perfil { Id = Guid.NewGuid(), Nome = nome };
	}

	public void RenomearPara(string nome) => Nome = nome;
}