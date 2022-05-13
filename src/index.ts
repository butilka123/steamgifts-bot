import axios from "axios";

const url = "https://www.steamgifts.com/";
const AxiosInstance = axios.create(); // Create a new Axios Instance

// Send an async HTTP Get request to the url
AxiosInstance.get(url)
  .then(
    // Once we have data returned ...
    (response) => {
      const html = response.data; // Get the HTML from the HTTP request
      console.log(html);
    }
  )
  .catch(console.error); // Error handling
