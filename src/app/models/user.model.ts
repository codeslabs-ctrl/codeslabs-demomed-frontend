export interface User {
  id: number;
  username: string;
  email: string;
  rol: string;
  medico_id?: number;
  nombres?: string;
  apellidos?: string;
  especialidad?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
