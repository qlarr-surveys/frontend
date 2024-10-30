import publicApi from "./publicApi";
import authenticatedApi from "./authenticatedApi";
import { CLOUD_URL } from "~/constants/networking";
import BaseService from "./BaseService";

class RunService extends BaseService {

  async start(lang, preview = false, guest = false, mode = "online") {
    const surveyId = sessionStorage.getItem("surveyId");
    if (guest) {
      const response = await this.handleRequest(() =>
        publicApi.post(`${CLOUD_URL}/survey/${surveyId}/run/start?mode=${mode}`, {
          lang,
        })
      );
      return response.data;
    } else if (preview) {
      const response = await this.handleRequest(() =>
        authenticatedApi.post(
          `/survey/${surveyId}/preview/start?mode=${mode}`,
          { lang }
        )
      );
      return response.data;
    } else {
      const response = await this.handleRequest(() =>
        publicApi.post(`/survey/${surveyId}/run/start`, { lang })
      );
      return response.data;
    }
  }

  async navigate(payload, preview = false, guest = false, mode = "online") {
    const surveyId = sessionStorage.getItem("surveyId");
    if (guest) {
      const response = await publicApi.post(
        `${CLOUD_URL}/survey/${surveyId}/run/navigate?mode=${mode}`,
        payload
      );
      return response.data;
    }
    if (preview) {
      const response = await authenticatedApi.post(
        `/survey/${surveyId}/preview/navigate?mode=${mode}`,
        payload
      );
      return response.data;
    } else {
      const response_1 = await publicApi.post(
        `/survey/${surveyId}/run/navigate`,
        payload
      );
      return response_1.data;
    }
  }
  async runtimeJs(preview, guest = false) {
    const surveyId = sessionStorage.getItem("surveyId");
    if (guest) {
      const response = await this.handleRequest(() =>
        publicApi.get(`${CLOUD_URL}/survey/${surveyId}/run/runtime.js`)
      );
      return response.data;
    } else if (preview) {
      const response = await this.handleRequest(() =>
        authenticatedApi.get(`/survey/${surveyId}/preview/runtime.js`)
      );
      return response.data;
    } else {
      const response = await this.handleRequest(() =>
        publicApi.get(`/survey/${surveyId}/run/runtime.js`)
      );
      return response.data;
    }
  }

  async uploadResponseFile(key, preview, file) {
    const surveyId = sessionStorage.getItem("surveyId");
    const responseId = sessionStorage.getItem("responseId");
    const formData = new FormData();
    formData.append("file", file);
    const api = preview ? authenticatedApi : publicApi;
    const url = preview
      ? `/survey/${surveyId}/response/preview/attach/${responseId}/${key}`
      : `/survey/${surveyId}/response/attach/${responseId}/${key}`;
    const response = await api.post(url, formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async uploadResponseBlob(key, preview, blob, fileName) {
    const surveyId = sessionStorage.getItem("surveyId");
    const responseId = sessionStorage.getItem("responseId");
    const formData = new FormData();
    formData.append("file", blob, fileName);
    const api = preview ? authenticatedApi : publicApi;
    const url = preview
      ? `/survey/${surveyId}/response/preview/attach/${responseId}/${key}`
      : `/survey/${surveyId}/response/attach/${responseId}/${key}`;
    const response = await api.post(url, formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
}

export default RunService;