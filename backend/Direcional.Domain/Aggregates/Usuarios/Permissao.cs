namespace Direcional.Domain.Aggregates.Usuarios;

public class Permissao
{
	public Guid Id { get; private set; }
	public string Chave { get; private set; } = string.Empty;
	public string Descricao { get; private set; } = string.Empty;

	private Permissao() { }

	public static Permissao Criar(string chave, string descricao)
	{
		return new Permissao { Id = Guid.NewGuid(), Chave = chave, Descricao = descricao };
	}
}

// Permissões disponíveis no sistema
public static class Permissoes
{
	public const string ApartamentosGerenciar = "apartamentos.gerenciar";
	public const string ReservasGerenciar = "reservas.gerenciar";
	public const string VendasGerenciar = "vendas.gerenciar";
	public const string ClientesGerenciar = "clientes.gerenciar";
	public const string UsuariosGerenciar = "usuarios.gerenciar";
	public const string RelatoriosVisualizar = "relatorios.visualizar";
}