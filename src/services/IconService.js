import axios from "axios";

class IconService {
  search(searchTerm, cancelToken) {
    return new Promise((resolve, reject) => {
      axios
        .get(
          `https://api.iconify.design/search?query=${searchTerm}&prefixes=mdi,fluent,ri&limit=100`,
          { cancelToken: cancelToken.token }
        )
        .then((data) => {
          resolve(data.data.icons);
        })
        .catch((err) => {
          if (axios.isCancel(err)) {
            console.log("Request canceled:", err.message);
          } else {
            reject(err);
          }
        });
    });
  }
}

export default new IconService();
