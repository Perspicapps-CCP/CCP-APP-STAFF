import { TestBed } from '@angular/core/testing';

import { UsuarioService } from './usuario.service';

describe('UsuarioService', () => {
  let service: UsuarioService;

  const mockUser = {
    access_token: 'e77c0b8a-a7b9-4c31-a524-a7c32e87b248',
    user: {
      id: '253e3e87-1981-4197-a140-eddb470b00af',
      username: 'Esteban.Bins',
      email: 'Nola_Wiza72@gmail.com',
      role: 'STAFF',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call get usuario and get user corrrectly', () => {
    service.usuario = mockUser;
    const user = service.usuario;
    expect(user).toEqual(mockUser);
    expect(user.access_token).toEqual('e77c0b8a-a7b9-4c31-a524-a7c32e87b248');
    expect(user.user.username).toEqual('Esteban.Bins');
    expect(user.user.email).toEqual('Nola_Wiza72@gmail.com');
    expect(user.user.role).toEqual('STAFF');
  });

  it('should call set usuario and set user correctly', () => {
    service.usuario = mockUser;
    const user = service.usuario;
    expect(user).toEqual(mockUser);
  });

  it('should call get token and get token correctly', () => {
    service.usuario = mockUser;
    const token = service.token;
    expect(token).toEqual('e77c0b8a-a7b9-4c31-a524-a7c32e87b248');
  });

  it('should call token and get "" when user dont exist', () => {
    const token = service.token;
    expect(token).toEqual('');
  });
});
