import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ILogin } from 'src/app/interfaces/auth/ILogin';
import { catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { environmentApiUrl } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private endPoint = `${environmentApiUrl}/auth`;

  // Nomes das chaves nos Cookies
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
  ) {}

  // --- GERENCIAMENTO DE TOKENS (COOKIES) ---

  getAccessToken(): string {
    return this.cookieService.get(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string {
    return this.cookieService.get(this.REFRESH_TOKEN_KEY);
  }

  saveTokens(access: string, refresh: string) {
    this.cookieService.set(this.ACCESS_TOKEN_KEY, access, {
      expires: 1,
      path: '/',
      secure: true, // Lembre-se: true exige HTTPS
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
  }

  // --- MÉTODOS DE API ---

  login(data: ILogin): Observable<any> {
    return this.http.post(`${this.endPoint}/login`, data).pipe(
      tap((response: any) => {
        if (response.accessToken && response.refreshToken) {
          this.saveTokens(response.accessToken, response.refreshToken);
        }
      }),
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<any>(`${this.endPoint}/refresh-token`, { refreshToken }) // Ajustei a URL para usar this.endPoint
      .pipe(
        tap((tokens) => {
          this.saveTokens(tokens.accessToken, tokens.refreshToken);
        }),
      );
  }

  logOut(): Observable<any> {
    return this.http.post(`${this.endPoint}/logout`, {}).pipe(
      tap(() => this.finalizarLogOut()),
      catchError(() => {
        this.finalizarLogOut();
        return of(null);
      }),
    );
  }

  private finalizarLogOut() {
    this.limparSessao();
    this.router.navigate(['/login']);
  }

  alterarSenha(senha: string): Observable<any> {
    return this.http.post(`${this.endPoint}/alterar-senha`, {
      novaSenha: senha,
    });
  }

  // --- MÉTODOS DE PERMISSÃO E ROLE (LEITURA DO TOKEN) ---

  /**
   * Extrai a lista de Permissões (ex: ['ocorrencia:criar']) do Token
   */
  public getUserPermissions(): string[] {
    // CORREÇÃO: Usar o método getter correto, não a string 'token'
    const token = this.getAccessToken();
    if (!token) return [];

    try {
      const decoded: any = jwtDecode(token);

      // Procura pela claim "Permissions" ou "permissions"
      // Se o .NET serializar diferente, você verá aqui.
      const permissions =
        decoded.Permissions ||
        decoded.permissions ||
        decoded['custom:permissions'] ||
        [];

      // Garante que retorna sempre um array, mesmo se vier string única
      return Array.isArray(permissions) ? permissions : [permissions];
    } catch (error) {
      return [];
    }
  }

  /**
   * (Opcional) Extrai o Nome do Cargo (ex: 'Admin') apenas para exibição na UI
   * Não use isso para lógica de segurança (use permissions), apenas para mostrar "Olá, Admin"
   */
  public getRoleName(): string {
    const token = this.getAccessToken();
    if (!token) return '';

    try {
      const decoded: any = jwtDecode(token);
      // Padrão do .NET para Role ou string simples 'role'
      return (
        decoded[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ] ||
        decoded.role ||
        decoded.Role ||
        ''
      );
    } catch {
      return '';
    }
  }

  public getUserId(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return (
        decoded.nameid ||
        decoded.sub ||
        decoded[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ] ||
        null
      );
    } catch {
      return null;
    }
  }
}
