import { onError } from "~/state/edit/editState";
import { processApiError } from "~/utils/errorsProcessor";

class BaseService {
  constructor(dispatch) {
    this.dispatch = dispatch;
  }

  async handleRequest(apiCall) {
    try {
      return await apiCall();
    } catch (error) {
      throw processApiError({
        error: error,
        globalErrorHandler: (processedError) => {
          this.dispatch(onError(processedError));
        },
      });
    }
  }
}

export default BaseService;
