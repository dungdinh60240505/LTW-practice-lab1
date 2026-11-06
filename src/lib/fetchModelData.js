import models from "../modelData/models";

/**
 * fetchModel - Fetch a model from the mock data (simulating web server API).
 *
 * Supported URLs:
 *   /test/info          - Returns models.schemaInfo()
 *   /user/list          - Returns models.userListModel()
 *   /user/:id           - Returns models.userModel(id)
 *   /photosOfUser/:id   - Returns models.photoOfUserModel(id)
 *
 * @param {string} url      The URL to issue the GET request.
 * @returns {Promise<any>}  A promise that resolves with the model data.
 */
    function fetchModel(url) {
      return new Promise((resolve, reject) => {
        if (url === "/test/info") {
          resolve(models.schemaInfo());
          return;
        }
    if (url === "/user/list") {
        resolve(models.userListModel());
        return;
      }

      const userMatch = url.match(/^\/user\/([^/]+)$/);
      if (userMatch) {
        const user = models.userModel(userMatch[1]);
        if (user) {
          resolve(user);
        } else {
          reject(new Error(`User not found: ${userMatch[1]}`));
        }
        return;
      }

      const photosMatch = url.match(/^\/photosOfUser\/([^/]+)$/);
      if (photosMatch) {
        const user = models.userModel(photosMatch[1]);
        if (user) {
          resolve(models.photoOfUserModel(photosMatch[1]));
        } else {
          reject(new Error(`User not found: ${photosMatch[1]}`));
        }
        return;
      }

      reject(new Error(`Unknown URL: ${url}`));
    });
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
