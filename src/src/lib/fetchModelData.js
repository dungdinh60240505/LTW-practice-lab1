/**
 * Base URL of the backend app (server-express).
 * Can be overridden with the REACT_APP_API_URL environment variable.
 */
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8081";

/**
 * fetchModel - Fetch a model from the backend web server.
 *
 * Supported URLs:
 *   /test/info            - Returns the SchemaInfo object
 *   /user/list            - Returns the list of users (_id, first_name, last_name)
 *   /user/:id             - Returns the details of a user
 *   /user/counts          - Returns photo/comment counts of every user (extra credit)
 *   /photosOfUser/:id     - Returns the photos (with comments) of a user
 *   /commentsOfUser/:id   - Returns the comments authored by a user (extra credit)
 *
 * @param {string} url      The URL to issue the GET request.
 * @returns {Promise<any>}  A promise that resolves with the model data
 *                          (parsed JSON) or rejects with an Error.
 */
async function fetchModel(url) {
  let response;
  try {
    response = await fetch(API_BASE_URL + url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    throw new Error(`Cannot reach the server (${err.message})`);
  }

  let data = null;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    const message =
      (data && data.message) || `${response.status} ${response.statusText}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

/**
 * imageUrl - Resolve a photo file from src/images.
 *
 * @param {string} fileName  The photo file name.
 */
export function imageUrl(fileName) {
  return require(`../images/${fileName}`);
}

/**
 * formatDate - Convert a model date string into a user friendly string.
 *
 * @param {string} dateTime  Date string from the model.
 */
export function formatDate(dateTime) {
  return new Date(String(dateTime).replace(" ", "T")).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default fetchModel;
