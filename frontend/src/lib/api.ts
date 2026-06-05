import axios from "axios";

const envBaseUrl = import.meta.env.VITE_API_URL;
const baseURL = envBaseUrl?.trim() || "http://localhost:5000";

export const api = axios.create({
	baseURL,
	headers: {
		Accept: "application/json",
	},
});
