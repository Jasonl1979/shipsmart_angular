using Customer.Data.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace ss_customers.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
     
    public class CustomerController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpFactory;
        private readonly ILogger<CustomerController> _logger;

        public CustomerController(IConfiguration configuration, IHttpClientFactory httpFactory, ILogger<CustomerController> logger)
        {
            _configuration = configuration;
            _httpFactory = httpFactory;
            _logger = logger;
        }

        //[Route("customers")]
        //[AllowAnonymous]
        [HttpGet]            
        public ActionResult<List<CustomerClass>> GetCustomers()
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

            List<CustomerClass2> listpartners = new List<CustomerClass2>();
            using (var cmdSelectCustomer = new NpgsqlCommand("SELECT p.*,c.contactid from public.partner as p inner join partner_contact as pc on pc.partnerid = p.partnerid inner join contact as c on c.contactid = pc.contactid", cnnn))
            {
                NpgsqlDataReader reader = cmdSelectCustomer.ExecuteReader();
                while (reader.Read())
                {
                    CustomerClass2 partner = new CustomerClass2
                    {
                        partnerid = reader.GetInt32(0),
                        partnername = reader.IsDBNull(1) ? null : reader.GetString(1),
                        partnertypeid = reader.GetInt32(2),
                        tradingas = reader.IsDBNull(3) ? null : reader.GetString(3),
                        partnercode = reader.IsDBNull(4) ? null : reader.GetString(4),
                        vatnumber = reader.IsDBNull(5) ? null : reader.GetString(5),
                        reference = reader.IsDBNull(6) ? null : reader.GetString(6),
                        daystosettle = reader.IsDBNull(7) ? null : reader.GetString(7),
                        description = reader.IsDBNull(8) ? null : reader.GetString(8),
                        termsofsale = reader.IsDBNull(9) ? null : reader.GetString(9),
                        registrationno = reader.IsDBNull(10) ? null : reader.GetString(10),
                        deliverytype = reader.IsDBNull(11) ? null : reader.GetString(11),
                        contactid = reader.GetInt32(12)
                    };
                    listpartners.Add(partner);
                }
                cnnn.Close();
            }
            return Ok(listpartners);
        }
    }    
}
