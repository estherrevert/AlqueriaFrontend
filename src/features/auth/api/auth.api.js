import { api } from "@/shared/api/client";
export async function login(email, password) {
    await api.get("/sanctum/csrf-cookie"); // 1) cookie CSRF
    await api.post("/api/login", { email, password }); // 2) login
    const { data } = await api.get("/api/user"); // 3) user
    return data;
}
export async function getUser() {
    const { data } = await api.get("/api/user");
    return data;
}
export async function logout() {
    await api.post("/api/logout");
}
