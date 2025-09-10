// Utility function to normalize API response format
export interface NormalizedApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
}

export function normalizeApiResponse<T = any>(
  response: any,
  defaultMessage: string = 'Lấy dữ liệu thành công'
): NormalizedApiResponse<T> {
  // If response is already normalized
  if (response && typeof response === 'object' && 'success' in response) {
    return {
      success: response.success,
      data: response.data || null,
      message: response.message || defaultMessage
    };
  }

  // If response has data field
  if (response && typeof response === 'object' && 'data' in response) {
    return {
      success: true,
      data: response.data,
      message: response.message || defaultMessage
    };
  }

  // If response is the data itself
  if (response && typeof response === 'object') {
    return {
      success: true,
      data: response,
      message: defaultMessage
    };
  }

  // If response is null or undefined
  return {
    success: false,
    data: null,
    message: 'Không có dữ liệu'
  };
}

export function createErrorResponse(
  message: string = 'Có lỗi xảy ra',
  status: number = 500
): NormalizedApiResponse {
  return {
    success: false,
    data: null,
    message
  };
}

export function createSuccessResponse<T>(
  data: T,
  message: string = 'Thành công'
): NormalizedApiResponse<T> {
  return {
    success: true,
    data,
    message
  };
}
