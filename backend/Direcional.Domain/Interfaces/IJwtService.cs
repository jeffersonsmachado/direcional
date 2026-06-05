namespace Direcional.Domain.Interfaces;

public interface IJwtService
{
	string GerarToken(Guid userId, string email, string perfil, IEnumerable<string> permissoes);
}