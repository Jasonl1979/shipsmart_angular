using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Auth.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        public AuthController(IConfiguration config) => _configuration = config;
        string userrole; 

        // POST api/auth/token
        [HttpPost("token")]
        [AllowAnonymous]
        public IActionResult Token([FromBody] User creds)
        {
            string connectionString = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                return NotFound("Connection string 'DefaultConnection' not found.");
            }

            NpgsqlConnection cnnn;
            string PGconnectionString = connectionString;
            cnnn = new NpgsqlConnection(PGconnectionString);
            try
            {
                cnnn.Open();
            }
            catch (Exception ex)
            {
                return NotFound("Connection not open");
            }

            var user = new User
            {
                company = creds.company,
                package = creds.package,
                username = creds.username,
                role = creds.role,
                pwdmatch = creds.pwdmatch,
                password = creds.password,
                expirydate = creds.expirydate
            };
            string? jwt;
            //using (var cmdSelect = new NpgsqlCommand("SELECT (password = crypt('" + creds.Password + "', password)) AS pwd_match, rolename,'package1' FROM users as u INNER JOIN roles as r on r.roleid = u.roleid WHERE email = '" + creds.Username + "' and password = crypt('" + creds.Password + "',password);", cnnn))
            using (var cmdSelect = new NpgsqlCommand("Select * from public.get_userinfo('"+creds.username+"','"+creds.password+"')", cnnn))
            {
                NpgsqlDataReader reader = cmdSelect.ExecuteReader();
                while (reader.Read())
                {
                    userrole = reader.GetString(2);
                    jwt = GenerateToken(user);                    
                    return Ok(new { result = jwt, company = reader.GetString(0), package = reader.GetString(1), role = reader.GetString(2), user = reader.GetString(3), expirydate = reader.GetDateTime(5) });

                }
                cnnn.Close();
            }            
            return Unauthorized(new { result = "false", role = "false", package = "false" });
        }        

        private string GenerateToken(User user)
        {
            var key = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key missing");
            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.username ?? string.Empty),
                new Claim(ClaimTypes.Role, userrole ?? string.Empty),
                new Claim(ClaimTypes.Email, user.username ?? string.Empty)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
        
    public class User
    {
        public string? company { get; set; }
        public string? package { get; set; }
        public string? username { get; set; }
        public string? role { get; set; }
        public Boolean? pwdmatch { get; set; }
        public string? password { get; set; }
        public DateOnly? expirydate { get; set; }
    }
}
