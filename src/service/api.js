//Import axios
import axios from "axios";
import store from "../store/modules/audioSource.module";

// Add a 401 response interceptor
axios.interceptors.response.use(
  function(response) {
    return response;
  },
  function(error) {
    if (error.response.status === 401) {
      let loginUrl =
        error.response.data.result +
        "?url=" +
        window.location.href +
        "&serviceName=Producer";
      window.location.replace(loginUrl);
    } else if (
      error.response.status === 503 &&
      error.response.data.message === "Task is disabled."
    ) {
      store.state.isTaskDisabled = true;
    } else if (
      error.response.status === 503 &&
      error.response.data.message === "Task is already deleted."
    ) {
      store.state.isTaskDeleted = true;
    } else {
      return Promise.reject(error);
    }
  }
);

//Public method
/**
 * Description: handle post method for url with header and body
 * @param {string} url
 * @param {object} header
 * @param {object} body
 * @return {null}
 */
const post = (
  url = "",
  body = {},
  header = {
    withCredentials: true,
  }
) =>
  axios
    .post(url, body, header)
    .then(handlePostResponse)
    .catch(error);

//Public method
/**
 * Description: handle put method for url with header and body
 * @param {string} url
 * @param {object} header
 * @param {object} body
 * @return {null}
 */
const put = (url = "", body = {}, header = { withCredentials: true }) =>
  axios
    .put(url, body, header)
    .then(handlePostResponse)
    .catch(error);

//Public method
/**
 * Description: handle Delete method for url with header and body
 * @param {string} url
 * @param {object} header
 * @param {object} body
 * @return {null}
 */
const trash = (url = "", body = {}, header = { withCredentials: true }) =>
  axios
    .delete(url, body, header)
    .then(handlePostResponse)
    .catch(error);

//Public method
/**
 * Description: handle get method for url with header and body
 * @param {string} url
 * @param {object} header
 * @param {object} body
 * @return {response}
 */
const get = (url = "", header = { withCredentials: true }) =>
  axios
    .get(url, header)
    .then(handleGetResponse)
    .catch((apierror) => {
      return {
        status: -1,
        statusText: apierror.message,
      };
    });

//Private Methods
/**
 * Description: Handle callback for success response
 * @param {object} _response
 * @return {object}
 */
const handlePostResponse = (_response) => {
  return _response;
};
//Private Methods
/**
 * Description: Handle callback for success response
 * @param {object} _response
 * @return {object}
 */
const handleGetResponse = (_response) => {
  return _response;
};

/**
 * Description: Handle callback for error
 * @param {object} _error
 * @return {object}
 */
const error = (_error) => {
  return _error;
};

//export APIService
export const APIService = { post, get, put, trash };
