using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Direcional.Domain.Aggregates.Usuarios;
using Direcional.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Direcional.Infrastructure.Auth;

public class JwtService : IJwtService
{
	private readonly IConfiguration _configuration;

	public JwtService(IConfiguration configuration)
	{
		_configuration = configuration;
	}

	public string GerarToken(Usuario usuario, string roleName)
	{
		var tokenHandler = new JwtSecurityTokenHandler();
		var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Secret"] ?? "ChaveSuperSecretaDirecionalERPDePeloMenos32Caracteres");

		var claims = new List<Claim>
		{
			new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
			new Claim(ClaimTypes.Name, usuario.Nome),
			new Claim(ClaimTypes.Email, usuario.Email),
            
            // 🌟 CRUCIAL: Injeta a Claim do tipo Role exigida pelo [Authorize(Roles = "...")]
            new Claim(ClaimTypes.Role, roleName)
		};

		var tokenDescriptor = new SecurityTokenDescriptor
		{
			Subject = new ClaimsIdentity(claims),
			Expires = DateTime.UtcNow.AddHours(8), // Sessão comercial padrão de 8h
			SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
			Issuer = _configuration["Jwt:Issuer"],
			Audience = _configuration["Jwt:Audience"]
		};

		var token = tokenHandler.CreateToken(tokenDescriptor);
		return tokenHandler.WriteToken(token);
	}
}