namespace Customer.Data.Model { 


    public class CustomerClass
    {
        public int partnerid { get; set; }
        public string partnername { get; set; }        
        public int partnertypeid { get; set; }
        public string tradingas { get; set; }
        public string partnercode{ get; set; }
        public string vatnumber { get; set; }
        public string reference { get; set; }
        public string daystosettle { get; set; }
        public string description { get; set; }
        public string termsofsale { get; set; }
        public string registrationno { get; set; }
        public string deliverytype { get; set; }
    }

    public class CustomerContactClass
    {
        public int partnerid { get; set; }
        public int contactid { get; set; }
    }

    public class ContactClass
    {
        public int contactid { get; set; }
        public string firstname { get; set; }
        public string lastname { get; set; }
        public string email1 { get; set; }
        public string email2 { get; set; }
        public string contactnumber1 { get; set; }
        public string contactnumber2 { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public string Suburb { get; set; }
        public string City { get; set; }
        public string Postalcode { get; set; }
    }

    public class CustomerClass2
    {
        public int partnerid { get; set; }
        public string partnername { get; set; }
        public int partnertypeid { get; set; }
        public string tradingas { get; set; }
        public string partnercode { get; set; }
        public string vatnumber { get; set; }
        public string reference { get; set; }
        public string daystosettle { get; set; }
        public string description { get; set; }
        public string termsofsale { get; set; }
        public string registrationno { get; set; }
        public string deliverytype { get; set; }
        public int contactid { get; set; }
        public string firstname { get; set; }
        public string lastname { get; set; }
        public string email1 { get; set; }
        public string email2 { get; set; }
        public string contactnumber1 { get; set; }
        public string contactnumber2 { get; set; }
        public string daddress1 { get; set; }
        public string daddress2 { get; set; }
        public string daddress3 { get; set; }
        public string daddress4 { get; set; }
        public string daddress5 { get; set; }
        public string dpcode { get; set; }
    }

    // Root myDeserializedClass = JsonConvert.DeserializeObject<List<Root>>(myJsonResponse);
    public class Billing
    {
        public string first_name { get; set; }
        public string last_name { get; set; }
        public string company { get; set; }
        public string address_1 { get; set; }
        public string address_2 { get; set; }
        public string city { get; set; }
        public string postcode { get; set; }
        public string country { get; set; }
        public string state { get; set; }
        public string email { get; set; }
        public string phone { get; set; }
    }

    public class Collection
    {
        public string href { get; set; }
    }

    public class Links
    {
        public List<Self> self { get; set; }
        public List<Collection> collection { get; set; }
    }

    public class MetaData
    {
        public int id { get; set; }
        public string key { get; set; }
        public string value { get; set; } 
    }

    public class Root
    {
        public int id { get; set; }
        public DateTime date_created { get; set; }
        public DateTime date_created_gmt { get; set; }
        public DateTime date_modified { get; set; }
        public DateTime date_modified_gmt { get; set; }
        public string email { get; set; }
        public string first_name { get; set; }
        public string last_name { get; set; }
        public string role { get; set; }
        public string username { get; set; }
        public Billing billing { get; set; }
        public Shipping shipping { get; set; }
        public bool is_paying_customer { get; set; }
        public string avatar_url { get; set; }
        public List<MetaData> meta_data { get; set; }
        public Links _links { get; set; }
    }

    public class Self
    {
        public string href { get; set; }
        public TargetHints targetHints { get; set; }
    }

    public class Shipping
    {
        public string first_name { get; set; }
        public string last_name { get; set; }
        public string company { get; set; }
        public string address_1 { get; set; }
        public string address_2 { get; set; }
        public string city { get; set; }
        public string postcode { get; set; }
        public string country { get; set; }
        public string state { get; set; }
        public string phone { get; set; }
    }

    public class TargetHints
    {
        public List<string> allow { get; set; }
    }


}
