export interface Lancamento {
  id:             number;
  date:           Date;
  date_gmt:       Date;
  guid:           GUID;
  modified:       Date;
  modified_gmt:   Date;
  slug:           string;
  status:         string;
  type:           string;
  link:           string;
  title:          GUID;
  featured_media: number;
  template:       string;
  meta:           any[];
  fields:         Fields;
  image:          string;
  _links:         Links;
}

export interface Links {
  self:               About[];
  collection:         About[];
  about:              About[];
  "wp:featuredmedia": WpFeaturedmedia[];
  "wp:attachment":    About[];
  curies:             Cury[];
}

export interface About {
  href: string;
}

export interface Cury {
  name:      string;
  href:      string;
  templated: boolean;
}

export interface WpFeaturedmedia {
  embeddable: boolean;
  href:       string;
}

export interface Fields {
  galeria:                   Galeria;
  tipo:                      string;
  ficha_tecnica:             FichaTecnica[];
  geral:                     FichaTecnica[];
  portfolio_header_repeater: PortfolioHeaderRepeater[];
  conceito:                  string;
  planta:                    Planta[];
  mapa:                      string;
  endereco:                  string;
  tamanho_do_card:           string;
  acompanhe_obra_galeria:    AcompanheObraGaleria[];
}

export interface AcompanheObraGaleria {
  image_acompanhe_obra_galeria:     Planta[] | boolean;
  etapa_acompanhe_obra_galeria:     string;
  porcentagem:                      string;
  descricao_acompanhe_obra_galeria: string;
}

export interface Planta {
  ID:          number;
  id:          number;
  title:       string;
  filename:    string;
  url:         string;
  alt:         string;
  author:      string;
  description: Ption;
  caption:     Ption;
  name:        string;
  date:        Date;
  modified:    Date;
  mime_type:   MIMEType;
  type:        Type;
  icon:        string;
  width:       number;
  height:      number;
  sizes:       Sizes;
}

export enum Ption {
  Empty = "",
  ReservaSantaIzabelCasaSede = "Reserva Santa Izabel - Casa Sede",
  The150MilMDeLazerEConvivência = "150 mil m² de lazer e convivência",
}

export enum MIMEType {
  ImageJPEG = "image/jpeg",
}

export interface Sizes {
  thumbnail:                 string;
  "thumbnail-width":         number;
  "thumbnail-height":        number;
  medium:                    string;
  "medium-width":            number;
  "medium-height":           number;
  medium_large:              string;
  "medium_large-width":      number;
  "medium_large-height":     number;
  large:                     string;
  "large-width":             number;
  "large-height":            number;
  galeria:                   string;
  "galeria-width":           number;
  "galeria-height":          number;
  galeria_portrait:          string;
  "galeria_portrait-width":  number;
  "galeria_portrait-height": number;
  "post-thumbnail":          string;
  "post-thumbnail-width":    number;
  "post-thumbnail-height":   number;
}

export enum Type {
  Image = "image",
}

export interface FichaTecnica {
  atributo: string;
  valor:    string;
}

export interface Galeria {
  imagem_em_pe: Planta;
  videos:       Planta;
  galeria:      Planta[];
}

export interface PortfolioHeaderRepeater {
  texto: string;
}

export interface GUID {
  rendered: string;
}
