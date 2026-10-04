import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';
import { credentialsInterceptor } from './credentials-interceptor';

describe('credentialsInterceptor', () => {
  const interceptor: HttpInterceptorFn = credentialsInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});
