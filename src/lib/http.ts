export function success(data: any, status = 200) {
  return {
    success: true,
    data,
  };
}

export function fail(message: string, status = 400) {
  return {
    success: false,
    error: message,
  };
}
