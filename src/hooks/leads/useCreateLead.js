import { useState } from 'react';
import axios from 'axios';

const baseUrl = process.env.REACT_APP_API_URL;
let url = `${baseUrl}/api/leads`;

const useCreateLead = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createLead = async (leadData) => {
    setLoading(true);
    try {
      const response = await axios.post(url, leadData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const responseData = response.data;
      console.log("Response Data:", responseData);
      if (responseData.error) {
        setError(responseData.error);
        setData(null);
        return null;
      }

      setData(responseData);
      setError(null);
      return responseData;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create lead';
      setError(errorMessage);
      setData(null);
      return err.response.data;
    } finally {
      setLoading(false);
    }
  };

  return { createLead, data, loading, error };
};

export default useCreateLead;