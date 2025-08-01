import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const baseUrl = process.env.REACT_APP_API_URL;
let url = `${baseUrl}/api/service`;

const useCreateService = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createService = async (serviceData) => {
    setLoading(true);
    try {
      const response = await axios.post(url, serviceData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const responseData = response.data;
      if (responseData.error) {
        setError(responseData.error);
        setData(null);
        toast.error(responseData.error);
        return null;
      }

      setData(responseData);
      setError(null);
      toast.success('Service Assigned successfully');
      return responseData;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create service';
      setError(errorMessage);
      setData(null);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createService, data, loading, error };
};

export default useCreateService;