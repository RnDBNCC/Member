import { API } from "./api";

export const authAPI = {
  login: (
    identifier: string,
    password: string
  ) =>
    API.post("/login", {
      identifier,
      password,
      appCode: "brac",
    }),

  forgotPassword: (email: string) =>
    API.post("/forgot-password", {
      email,
      appCode: "brac",
    }),

  changePassword: (data: {
    oldPassword: string;
    newPassword: string;
  }) =>
    API.put("/users/password", data),
};

export interface ForgotPasswordPayload {
  email: string;
  appCode: string;
}

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const response = await apiClient.post("/forgot-password", payload);
  return response.data;
};
