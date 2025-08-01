import axios from 'axios';
import toast from 'react-hot-toast';

const baseUrl= process.env.REACT_APP_API_URL;
const url=baseUrl+"/api/ticket";

const getAllTickets = async (page, limit, search= null) => {
  try {
    const response = await axios.get(`${url}?q=${search}&page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = response.data;
    // console.log("api actions",data);
    return data;
  } catch (error) {
    console.error( error?.response?.data);
    return error?.response?.data;
  }};



const createTicket = async (ticketData) => {
  try {
    // console.log("new action data",actionData);
    const response = await axios.post(`${url}`, ticketData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.error(error.response.data);
    return error.response.data;
  }
};

const updateTicket = async (id, updatedData) => {
  // console.log(id,updatedData);
  
  try {
    // console.log(updatedData);
    const response = await axios.put(`${url}/${id}`, updatedData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.error(error.response.data);
    return error.response.data;
  }
};

const deleteTicket = async (Id) => {
  try {
    const response = await axios.delete(`${url}/${Id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = response.data;

    return data;
  } catch (error) {
    console.error(error);
    return error?.response?.data;
  }
};

export { getAllTickets, createTicket, updateTicket, deleteTicket };
