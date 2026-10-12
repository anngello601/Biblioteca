import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { jwtInterceptor } from './credentials-interceptor';
import { of } from 'rxjs';

describe('jwtInterceptor', () => {
  const interceptor: HttpInterceptorFn = jwtInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('adds the JWT to backend API requests', () => {
    sessionStorage.setItem('authToken', 'test-token');
    const request = new HttpRequest('GET', 'http://localhost:8080/api/auth/usuario');
    let outgoingRequest: HttpRequest<unknown> | undefined;

    TestBed.runInInjectionContext(() => interceptor(request, outgoing => {
      outgoingRequest = outgoing;
      return of(new HttpResponse());
    })).subscribe();

    expect(outgoingRequest?.headers.get('Authorization')).toBe('Bearer test-token');
    sessionStorage.removeItem('authToken');
  });

  it('does not send the JWT to the login endpoint', () => {
    sessionStorage.setItem('authToken', 'test-token');
    const request = new HttpRequest('POST', 'http://localhost:8080/api/auth/login', null);
    let outgoingRequest: HttpRequest<unknown> | undefined;

    TestBed.runInInjectionContext(() => interceptor(request, outgoing => {
      outgoingRequest = outgoing;
      return of(new HttpResponse());
    })).subscribe();

    expect(outgoingRequest?.headers.has('Authorization')).toBe(false);
    sessionStorage.removeItem('authToken');
  });
});
