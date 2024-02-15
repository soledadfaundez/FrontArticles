import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiServer } from '../config/apiServer';

@Injectable({
  providedIn: 'root'
})

export class ArticlesService {

  urlFavorites = apiServer.url;

  options = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json' // Especifica el tipo de contenido del cuerpo de la solicitud
    })
  };
  
  constructor(private http: HttpClient) {}
  
  getArticles(APIUrl: string): Observable<any> {
    return this.http.get(APIUrl);
  }

  postArticlesFav(url: any, body: any ): Observable<any> {
    return this.http.post(`${this.urlFavorites}${url}`, body, this.options); //EFC: Siempre indicar el tipo de mensaje
  }

  deleteArticlesFav(id:number|string) {
    return this.http.delete(this.urlFavorites + `articles/${id}`); //EFC: Tilde invertida, para incorporar variable
  }

  getArticlesFav(id:number|string) {
    return this.http.get(this.urlFavorites + `articles/${id}`); //EFC: Tilde invertida, para incorporar variable
  }

  findArticlesFav(APIUrl: string): Observable<any> {
    return this.http.get(APIUrl); //EFC: Tilde invertida, para incorporar variable
  }
}
