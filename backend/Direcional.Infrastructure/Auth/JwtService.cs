using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Direcional.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Direcional.Infrastructure.Auth;

public class JwtService(IConfiguration configuration) : IJwtService
{
	public string GerarToken(Guid userId, string email, string perfil, IEnumerable<string> permissoes)
	{
		var chave = configuration["Jwt:Chave"]!;
		var emissor = configuration["Jwt:Emissor"]!;
		var audiencia = configuration["Jwt:Audiencia"]!;

		var claims = new List<Claim>
		{
			new(JwtRegisteredClaimNames.Sub, userId.ToString()),
			new(JwtRegisteredClaimNames.Email, email),
			new(ClaimTypes.Role, perfil),
			new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
		};

		claims.AddRange(permissoes.Select(p => new Claim("permissao", p)));

		var chaveBytes = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(chave));
		var credenciais = new SigningCredentials(chaveBytes, SecurityAlgorithms.HmacSha256);

		var token = new JwtSecurityToken(
			issuer: emissor,
			audience: audiencia,
			claims: claims,
			expires: DateTime.UtcNow.AddHours(8),
			signingCredentials: credenciais);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}
}