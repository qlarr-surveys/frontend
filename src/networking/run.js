import { BACKEND_BASE_URL } from '~/constants/networking';

export const getparam = (params, key) => {
  if (window["Android"]) {
    return window["Android"].getParam(key);
  } else {
    return params[key];
  }
};

export const startNavigation = (runService, lang, preview, guest, mode) => {
  if (window["Android"]) {
    return new Promise((resolve, reject) => {
      window["Android"].start();
      window["navigateOffline"] = (res) => {
        resolve(res);
      };
    });
  } else {
    return runService.start(lang, preview, guest, mode);
  }
};

export const continueNavigation = (
  runService,
  payload,
  responseId,
  preview,
  guest,
  mode
) => {
  const finalObj = {
    ...payload,
    responseId: responseId,
  };
  if (window["Android"]) {
    return new Promise((resolve, reject) => {
      window["Android"].navigate(JSON.stringify(finalObj));
      window["navigateOffline"] = (res) => {
        resolve(res);
      };
    });
  } else {
    return runService.navigate(finalObj, preview, guest, mode);
  }
};

export const uploadFile = (runService, key, preview, selectedFile) => {
  if (window["Android"]) {
    return new Promise((resolve, reject) => {
      window["Android"].uploadFile(key, selectedFile.name);
      window["onFileUploaded"] = (res) => {
        resolve(res);
      };
    });
  }
  return runService.uploadResponseFile(key, preview, selectedFile);
};

export const uploadDataUrl = (runService, key, preview, dataurl, fileName) => {
  if (window["Android"]) {
    return new Promise((resolve, reject) => {
      window["Android"].uploadDataUrl(key, dataurl, fileName);
      window["onDataUrlUploaded"] = (res) => {
        resolve(res);
      };
    });
  }
  const blob = dataURLtoBlob(dataurl);
  return runService.uploadResponseBlob(key, preview, blob, fileName);
};

export const dataURLtoBlob = (dataurl) => {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export const downloadFileAsBase64 = (url) => {
  return fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((callback) => {
          let reader = new FileReader();
          reader.onload = function () {
            callback(this.result);
          };
          reader.readAsDataURL(blob);
        })
    );
};

export const loadScript = (runService, preview, guest) =>
  new Promise((resolve, reject) => {
    runService
      .runtimeJs(preview, guest)
      .then((data) => {
        const script = document.createElement("script");
        script.innerHTML = data;
        document.body.appendChild(script);
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });


  export const previewUrl = (fileName) => {
    const surveyId = sessionStorage.getItem("surveyId");
    return BACKEND_BASE_URL + `/survey/${surveyId}/response/attach/${fileName}`;
  };
