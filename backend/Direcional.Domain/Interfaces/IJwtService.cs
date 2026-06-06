using Direcional.Domain.Aggregates.Usuarios;

namespace Direcional.Domain.Interfaces;

public interface IJwtService
{
	string GerarToken(Usuario usuario, string roleName);
}