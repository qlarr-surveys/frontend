import authenticatedApi from "./authenticatedApi";
import publicApi from "./publicApi";
import BaseService from "./BaseService";
import { CLOUD_URL } from "~/constants/networking";

class SurveyService extends BaseService {
  async getAllSurveys(page, perpage, status, sortBy) {
    const response = await this.handleRequest(() =>
      authenticatedApi.get(
        `/survey/all?page=${page}&per_page=${perpage}&status=${status}&sort_by=${sortBy}`
      )
    );
    return response.data;
  }

  async getGuestsSurveys() {
    const response = await this.handleRequest(() =>
      publicApi.get(`${CLOUD_URL}/guest/survey/all`)
    );
    return response.data;
  }

  async getSurvey() {
    const surveyId = sessionStorage.getItem("surveyId");
    const response = await this.handleRequest(() =>
      authenticatedApi.get(`/survey/${surveyId}`)
    );
    return response.data;
  }

  async createSurvey(data) {
    const response = await this.handleRequest(() =>
      authenticatedApi.post(`/survey/create`, data)
    );
    return response.data;
  }

  async putSurvey(data, surveyId) {
    const response = await this.handleRequest(() =>
      authenticatedApi.put(`/survey/${surveyId}`, data)
    );
    return response.data;
  }

  async closeSurvey(surveyId) {
    const response = await this.handleRequest(() =>
      authenticatedApi.put(`/survey/${surveyId}/close`)
    );
    return response.data;
  }

  async cloneSurvey(surveyId, data) {
    const response = await this.handleRequest(() =>
      authenticatedApi.post(`/survey/${surveyId}/clone`, data)
    );
    return response.data;
  }

  async cloneGuestSurvey(surveyId, data) {
    const response = await this.handleRequest(() =>
      authenticatedApi.post(`/survey/${surveyId}/clone_guest`, data)
    );
    return response.data;
  }

  async deleteSurvey(surveyId) {
    const response = await this.handleRequest(() =>
      authenticatedApi.delete(`/survey/${surveyId}`)
    );
    return response.data;
  }

  async allResponse(surveyId, dbValues, page, per_page, complete, surveyor) {
    const shouldAddComplete = complete === true || complete === false;
    const response = await this.handleRequest(() =>
      authenticatedApi.get(
        `/survey/${surveyId}/response/all?db_values=${dbValues}&page=${page}&per_page=${per_page}` +
          `${shouldAddComplete ? `&complete=${complete}` : ""}` +
          `${surveyor ? `&surveyor=${surveyor}` : ""}`
      )
    );
    return response.data;
  }

  async exportResponses(surveyId, timezone, dbValues, complete) {
    const shouldAddComplete = complete === true || complete === false;
    const response = await this.handleRequest(() =>
      authenticatedApi.get(
        `/survey/${surveyId}/response/export?db_values=${dbValues}&timezone=${timezone}` +
          `${shouldAddComplete ? `&complete=${complete}` : ""}`
      )
    );
    return response.data;
  }

  async deleteResponse(surveyId, responseId) {
    const response = await this.handleRequest(() =>
      authenticatedApi.delete(`/survey/${surveyId}/response/${responseId}`)
    );
    return response;
  }

  async eventResponse(responseId) {
    const surveyId = sessionStorage.getItem("surveyId");
    const response = await this.handleRequest(() =>
      authenticatedApi.get(`/survey/${surveyId}/response/${responseId}/events`)
    );
    return response;
  }

  async importSurvey(file, surveyName) {
    const formData = new FormData();
    formData.append("survey_name", surveyName);
    formData.append("file", file);
    const response = await this.handleRequest(() =>
      authenticatedApi.post(`/survey/import`, formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      })
    );
    return response.data;
  }

  async exportSurvey(surveyId) {
    const response = await this.handleRequest(() =>
      authenticatedApi.get(`/survey/${surveyId}/export`, { responseType: 'blob' })
    );
    const contentDisposition = response.headers.get("Content-Disposition");
    const filename = contentDisposition
      ? contentDisposition.match(/filename="(.+)"/)?.[1] || `${surveyId}.zip`
      : `${surveyId}.zip`;

    console.log(response)
    // Convert the response to a Blob
    const blob = await response.data;

    // Trigger the file download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default SurveyService;
