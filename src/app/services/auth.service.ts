import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, map, of } from 'rxjs';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service'; // <--- Importe o serviço
import { URL } from 'src/app/helper/constantes';
import { ILogin } from 'src/app/interfaces/auth/ILogin';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private endPoint = `${URL}/auth`;

  // Nomes das chaves nos Cookies
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService, // <--- Injete o serviço
  ) {}

  // --- GERENCIAMENTO DE TOKENS (COOKIES) ---

  getAccessToken(): string {
    return this.cookieService.get(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string {
    return this.cookieService.get(this.REFRESH_TOKEN_KEY);
  }

  saveTokens(access: string, refresh: string) {
    // Expiração: Exemplo de 1 dia (ajuste conforme a regra do seu token JWT)
    // path: '/' permite que o cookie seja acessível em todas as rotas
    // secure: true (só funciona em HTTPS ou localhost)
    // sameSite: 'Strict' ou 'Lax' para proteção CSRF

    this.cookieService.set(this.ACCESS_TOKEN_KEY, access, {
      expires: 1,
      path: '/',
      secure: true,
      sameSite: 'Strict',
    });
    this.cookieService.set(this.REFRESH_TOKEN_KEY, refresh, {
      expires: 7,
      path: '/',
      secure: true,
      sameSite: 'Strict',
    });
  }

  limparSessao() {
    this.cookieService.delete(this.ACCESS_TOKEN_KEY, '/');
    this.cookieService.delete(this.REFRESH_TOKEN_KEY, '/');
    localStorage.removeItem('roles'); // Roles podem continuar no localStorage se preferir, ou mover para cookie
  }

  // --- MÉTODOS DE API ---

  login(data: ILogin): Observable<any> {
    return this.http
      .post(`${this.endPoint}/login`, data) // withCredentials geralmente não é necessário se vc manda token no Header via Interceptor
      .pipe(
        // 1. Salva os tokens assim que o login dá sucesso
        tap((response: any) => {
          // Assumindo que seu backend retorna { accessToken: '...', refreshToken: '...' }
          // Se os nomes vierem maiúsculos (AccessToken), ajuste aqui.
          if (response.accessToken && response.refreshToken) {
            this.saveTokens(response.accessToken, response.refreshToken);
          }
        }),
        // 2. Continua o fluxo original
        switchMap((loginResponse: any) => {
          if (loginResponse.primeiroAcesso === true) {
            return of(loginResponse);
          }
          return this.getAccountRole().pipe(map(() => loginResponse));
        }),
      );
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();

    // Envia o refresh token para obter um novo par
    return this.http
      .post<any>(`${URL}/auth/refresh-token`, { refreshToken })
      .pipe(
        tap((tokens) => {
          this.saveTokens(tokens.accessToken, tokens.refreshToken);
        }),
      );
  }

  logOut(): Observable<any> {
    return this.http.post(`${this.endPoint}/logout`, {}).pipe(
      tap(() => {
        this.limparSessao();
        this.router.navigate(['/login']);
      }),
      // Garante que limpa mesmo se a API der erro
      catchError(() => {
        this.limparSessao();
        this.router.navigate(['/login']);
        return of(null);
      }),
    );
  }

  alterarSenha(data: string): Observable<any> {
    return this.http.post(`${this.endPoint}/alterar-senha`, {
      novaSenha: data,
    });
  }

  // --- ROLES (Mantendo lógica original ou movendo para cookie se quiser) ---

  private getAccountRole(): Observable<any> {
    return this.http
      .get(`${this.endPoint}/get-account-roles`)
      .pipe(tap((res: any) => this.setRole(res)));
  }

  private setRole(roles: string[]) {
    // Roles costumam ser arrays grandes, localStorage é melhor que Cookie (limite 4kb) para isso
    localStorage.setItem('roles', JSON.stringify(roles));
  }

  getRole(): string[] {
    const roles = localStorage.getItem('roles');
    if (roles) {
      return JSON.parse(roles);
    }
    return [];
  }
}
