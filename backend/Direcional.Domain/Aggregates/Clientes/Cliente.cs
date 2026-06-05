namespace Direcional.Domain.Aggregates.Clientes;

public class Cliente
{
	public Guid Id { get; private set; }
	public string Nome { get; private set; } = string.Empty;
	public string CPF { get; private set; } = string.Empty;
	public string Email { get; private set; } = string.Empty;
	public string Telefone { get; private set; } = string.Empty;

	private Cliente() { }

	public static Cliente Criar(string nome, string cpf, string email, string telefone)
	{
		return new Cliente
		{
			Id = Guid.NewGuid(),
			Nome = nome,
			CPF = cpf,
			Email = email,
			Telefone = telefone
		};
	}
}