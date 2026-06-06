import axios from "axios";

const envBaseUrl = import.meta.env.VITE_API_URL;
const baseURL = envBaseUrl?.trim() || "http://localhost:5000";

export const api = axios.create({
	baseURL,
	headers: {
		Accept: "application/json",
	},
});

// Interceptor para adicionar o token JWT em cada requisição de forma automática
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("direcional_token");
	if (token && config.headers) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});
