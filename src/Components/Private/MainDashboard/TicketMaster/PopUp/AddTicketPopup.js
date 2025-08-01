import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { RequiredStar } from "../../../RequiredStar/RequiredStar";
import { createTicket } from "../../../../../hooks/useTicket"
import { getCustomers } from "../../../../../hooks/useCustomer";
import { getAddress } from "../../../../../hooks/usePincode";
import Select from "react-select";



const PAGE_SIZE = 15;

const AddTicketPopup = ({ handleAdd }) => {
  const [client, setClient] = useState("");
  const [details, setDetails] = useState("");
  const [product, setProduct] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [source, setSource] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [hasMoreCustomers, setHasMoreCustomers] = useState(true);
  const [customerPage, setCustomerPage] = useState(1);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [contactPersonEmail, setContactPersonEmail] = useState("");
  const [Address, setAddress] = useState({
    add: "",
    city: "",
    country: "",
    pincode: "",
    state: ""
  })

  // Load customers with pagination and search
  const loadCustomers = useCallback(async (page = 1, search = "") => {
    try {
      const data = await getCustomers(page, PAGE_SIZE, search);
      if (data && data.customers) {
        if (page === 1) {
          setCustomers(data.customers);
        } else {
          setCustomers(prev => [...prev, ...data.customers]);
        }
        setHasMoreCustomers(data.customers.length === PAGE_SIZE);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    loadCustomers(1, customerSearchTerm);
  }, [loadCustomers, customerSearchTerm]);

  const handleEmployeeAdd = async (event) => {
    event.preventDefault();
    const ticketData = {
      client,
      details,
      product,
      contactPerson,
      contactNumber,
      source,
      Address,
      contactPersonEmail
    };
    if (!client || !details || !product || !contactPerson || !contactNumber || !source || !Address) {
      return toast.error("Please fill all fields");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactPersonEmail)) {
      return toast.error("Please Enter Valid Email");
    }
    if (contactNumber.length !== 10) {
      return toast.error("Please Enter Valid Contact Number");
    }
    if (/[a-zA-Z]/.test(contactNumber)) {
      return toast.error("Phone number should not contain alphabets");
    }
    toast.loading("Creating Ticket...")
    const data = await createTicket(ticketData);
    toast.dismiss()
    if (data.success){
      handleAdd();
      toast.success(data?.message);
    }else{
      toast.error(data?.error || "Failed to create ticket");
    }
  };



  useEffect(() => {
    const fetchData = async () => {
      const data = await getAddress(Address.pincode);

      if (data !== "Error") {
        setAddress(prevAddress => ({
          ...prevAddress,
          state: data.state,
          city: data.city,
          country: data.country
        }));
      }
    };
    if (Address.pincode >= 6)
      fetchData();
  }, [Address.pincode]);


  //  create a new seperate validations function

  const handlePincodeChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setAddress({ ...Address, pincode: value });
    }
  };


  const handleStateChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setAddress({ ...Address, state: value })
    }
  }

  const handleCityChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setAddress({ ...Address, city: value });
    }
  };

  const handleCountryChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setAddress({ ...Address, country: value })
    }
  }

  const handleContactPersonName = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setContactPerson(value);
    }
  };

  const contactPersonNumber = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setContactNumber(value);
    }
  };


  return (
    <>
      <div
        className="modal fade show"
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#00000090",
        }}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content p-3">
            <form onSubmit={handleEmployeeAdd}>
              <div className="modal-header pt-0">
                <h5 className="card-title fw-bold" id="exampleModalLongTitle">
                  Create New Ticket
                  {/* Forward */}
                </h5>
                <button
                  onClick={() => handleAdd()}
                  type="button"
                  className="close px-3"
                  style={{ marginLeft: "auto" }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="row modal_body_height">
                  <div className="col-12">
                    <div className="mb-3">
                      <label
                        htmlFor="clientName"
                        className="form-label label_text"
                      >
                        Client Name <RequiredStar />
                      </label>
                      <Select
                        id="clientName"
                        options={customers.map(customer => ({ 
                          value: customer._id, 
                          label: customer.custName 
                        }))}
                        value={selectedCustomer}
                        onChange={(selectedOption) => {
                          setSelectedCustomer(selectedOption);
                          setClient(selectedOption ? selectedOption.value : "");
                        }}
                        onInputChange={(inputValue) => {
                          setCustomerSearchTerm(inputValue);
                          setCustomerPage(1);
                        }}
                        onMenuScrollToBottom={() => {
                          if (hasMoreCustomers) {
                            const nextPage = customerPage + 1;
                            setCustomerPage(nextPage);
                            loadCustomers(nextPage, customerSearchTerm);
                          }
                        }}
                        placeholder="Search and select client..."
                        isClearable
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            borderRadius: 0,
                            borderColor: '#ced4da',
                            fontSize: '16px',
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#f8f9fa' : 'white',
                            color: state.isSelected ? 'white' : '#212529',
                          }),
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-12  mt-2">
                    <div className="row border mt-4 bg-gray mx-auto">
                      <div className="col-12 mb-3">
                        <span className="AddressInfo">Address <RequiredStar /></span>
                      </div>

                      <div className="col-12 col-lg-6 mt-2">
                        <div className="mb-3">
                          <input
                            type="text"
                            maxLength={6}
                            className="form-control rounded-0"
                            placeholder="Pincode"
                            id="exampleInputEmail1"
                            value={Address.pincode}
                            onChange={handlePincodeChange}
                            aria-describedby="emailHelp"
                          />
                        </div>
                      </div>

                      <div className="col-12 col-lg-6 mt-2">
                        <div className="mb-3">
                          <input
                            type="text"
                            className="form-control rounded-0"
                            placeholder="State"
                            id="exampleInputEmail1"
                            maxLength={50}
                            onChange={handleStateChange}
                            value={Address.state}
                            aria-describedby="emailHelp"
                          />
                        </div>
                      </div>

                      <div className="col-12 col-lg-6 mt-2">
                        <div className="mb-3">
                          <input
                            type="text"
                            maxLength={50}
                            className="form-control rounded-0"
                            placeholder="City"
                            id="exampleInputEmail1"
                            onChange={handleCityChange}
                            // onChange={(e) => setAddress({ ...Address, city: e.target.value })}
                            value={Address.city}
                            aria-describedby="emailHelp"
                          />
                        </div>
                      </div>

                      <div className="col-12 col-lg-6 mt-2">
                        <div className="mb-3">
                          <input
                            type="text"
                            maxLength={50}
                            className="form-control rounded-0"
                            placeholder="Country"
                            id="exampleInputEmail1"
                            onChange={handleCountryChange}
                            value={Address.country}
                            aria-describedby="emailHelp"
                          />
                        </div>
                      </div>

                      <div className="col-12 col-lg-12 mt-2">
                        <div className="mb-3">
                          <textarea
                            className="textarea_edit col-12"
                            id=""
                            name=""
                            maxLength={500}
                            placeholder="House NO., Building Name, Road Name, Area, Colony"
                            onChange={(e) => setAddress({ ...Address, add: e.target.value })}
                            value={Address.add}
                            rows="2"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="mb-3">
                      <label
                        for="clientName"
                        className="form-label label_text"
                      >
                        Complaint Details <RequiredStar />
                      </label>
                      <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        className="form-control rounded-0"
                        id="name"
                        maxLength={300}
                        aria-describedby="emailHelp"
                        required
                      ></textarea>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="mb-3">
                      <label
                        for="clientName"
                        className="form-label label_text"
                      >
                        Product <RequiredStar />
                      </label>
                      <select
                        className="form-select rounded-0"
                        id=""
                        aria-label="Default select example"
                        onChange={(e) => setProduct(e.target.value)}
                        required
                      >
                        <option value=" ">Select Product</option>
                        <option value={"Surveillance System"}>Surveillance System</option>
                        <option value={"Access Control System"}>Access Control System</option>
                        <option value={"Turnkey Project"}>Turnkey Project</option>
                        <option value={"Alleviz"}>Alleviz</option>
                        <option value={"CafeLive"}>CafeLive</option>
                        <option value={"WorksJoy"}>WorksJoy</option>
                        <option value={"WorksJoy Blu"}>WorksJoy Blu</option>
                        <option value={"Fire Alarm System"}>Fire Alarm System</option>
                        <option value={"Fire Hydrant System"}>Fire Hydrant System</option>
                        <option value={"IDS"}>IDS</option>
                        <option value={"AI Face Machines"}>AI Face Machines</option>
                        <option value={"Entrance Automation"}>Entrance Automation</option>
                        <option value={"Guard Tour System"}>Guard Tour System</option>
                        <option value={"Home Automation"}>Home Automation</option>
                        <option value={"IP PA and Communication System"}>IP PA and Communication System</option>
                        <option value={"CRM"}>CRM</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-12 col-lg-6 mt-2">
                    <div className="mb-3">
                      <label htmlFor="ContactPerson" className="form-label label_text">
                        Contact Person Name <RequiredStar />
                      </label>
                      <input
                        type="text"
                        maxLength={50}
                        value={contactPerson}
                        onChange={handleContactPersonName}
                        className="form-control rounded-0"
                        id="ContactPerson"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-lg-6 mt-2">
                    <div className="mb-3">
                      <label
                        for="Department"
                        className="form-label label_text"
                      >
                        Contact Person Email <RequiredStar />
                      </label>
                      <input
                        type="email"
                        maxLength={50}
                        value={contactPersonEmail}
                        onChange={(e) => setContactPersonEmail(e.target.value)}
                        className="form-control rounded-0"
                        id="email"
                        aria-describedby="emailHelp"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-lg-6 mt-2">
                    <div className="mb-3">
                      <label
                        for="Designation"
                        className="form-label label_text"
                      >
                        Contact Person No. <RequiredStar />
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        value={contactNumber}
                        // onChange={(e) => setContactNumber(e.target.value)}
                        onChange={contactPersonNumber}
                        className="form-control rounded-0"
                        id="name"
                        aria-describedby="emailHelp"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-lg-6 mt-2">
                    <div className="mb-3">
                      <label
                        for="Department"
                        className="form-label label_text"
                      >
                        Complaint Source <RequiredStar />
                      </label>
                      <select
                        className="form-select rounded-0"
                        id=""
                        aria-label="Default select example"
                        onChange={(e) => setSource(e.target.value)}
                        required
                      ><option >Select Source</option>
                        <option value={"Email"}>Email</option>
                        <option value={"Call"}>Call</option>
                        <option value={"WhatsApp"}>WhatsApp</option>
                        <option value={"SMS"}>SMS</option>
                        <option value={"Direct"}>Direct</option>
                      </select>
                    </div>
                  </div>



                  <div className="row">
                    <div className="col-12 pt-3 mt-2">
                      <button
                        type="submit"
                        onClick={handleEmployeeAdd}
                        className="w-80 btn addbtn rounded-0 add_button   m-2 px-4"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={handleAdd}
                        className="w-80  btn addbtn rounded-0 Cancel_button m-2 px-4"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTicketPopup;