import { TestBed } from '@angular/core/testing';

import { UsuarioService } from './usuario.service';

describe('UsuarioService', () => {
  let service: UsuarioService;

  const mockUser = {
    token: "14f8159c-3ca0-4842-8afe-862fa36f4e17",
    usuario: "Lazaro_Lebsack",
    nombres: "Ottis",
    apellidos: "Olson",
    fullName: "Ada Bailey",
    email: "a.clavijo@prueba.com",
    phone: "3153115153"
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
    expect(user?.token).toEqual("14f8159c-3ca0-4842-8afe-862fa36f4e17");
    expect(user?.usuario).toEqual("Lazaro_Lebsack");
    expect(user?.nombres).toEqual("Ottis");
    expect(user?.apellidos).toEqual("Olson");
    expect(user?.fullName).toEqual("Ada Bailey");
    expect(user?.email).toEqual("a.clavijo@prueba.com");
    expect(user?.phone).toEqual("3153115153");
  });


  it('should call set usuario and set user correctly', () => {
    service.usuario = mockUser;
    const user = service.usuario;
    expect(user).toEqual(mockUser);
  });

  it('should call get token and get token correctly', () => {
    service.usuario = mockUser;
    const token = service.token;
    expect(token).toEqual("14f8159c-3ca0-4842-8afe-862fa36f4e17");
  });

  it('should call token and get "" when user dont exist', () => {
    const token = service.token;
    expect(token).toEqual("");
  });

})
