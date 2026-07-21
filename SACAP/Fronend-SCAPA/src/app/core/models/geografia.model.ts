export interface PaisDTO {
  idPais: number;
  nombre: string;
  codigoIso: string;
}

export interface ProvinciaDTO {
  idProvincia: number;
  nombre: string;
  idPais: number;
  nombrePais?: string;
}

export interface CiudadDTO {
  idCiudad: number;
  nombre: string;
  idProvincia: number;
  nombreProvincia?: string;
}
