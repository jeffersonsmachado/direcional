namespace Direcional.Domain.Aggregates.Usuarios;

public class PerfilPermissao
{
	public Guid PerfilId { get; private set; }
	public Guid PermissaoId { get; private set; }
	public Permissao Permissao { get; private set; } = null!;

	private PerfilPermissao() { }

	public static PerfilPermissao Criar(Guid perfilId, Guid permissaoId)
	{
		return new PerfilPermissao { PerfilId = perfilId, PermissaoId = permissaoId };
	}
}