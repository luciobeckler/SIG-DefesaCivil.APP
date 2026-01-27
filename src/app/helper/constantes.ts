import { environment } from 'src/environments/environment.prod';

export const environmentApiUrl: string = environment.production
  ? 'https://sig-defesacivil-api.onrender.com/api'
  : 'https://localhost:7233/api';
