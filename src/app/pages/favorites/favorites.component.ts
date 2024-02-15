import { Component, OnInit } from '@angular/core';
import { ArticlesService } from '../../services/articles.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { apiServer } from '../../config/apiServer';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [  CommonModule,
              FormsModule,],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent implements OnInit{

  private textoCambios = new Subject<string>();
  variableLocal: string = '';
  miJSON: any; // Variable para almacenar el JSON
  mostrandoSpinner: boolean = false; //EFC: Para spinner
  mostrarNoHayRegistros: boolean = false; //EFC: Para spinner  
  cantPages: number=10; // O el tipo adecuado para tu caso
  filtroTitulo: string=""; 

  optionsCantPages = [
    { value: '10', label: '10' },
    { value: '5', label: '5' },
    { value: '3', label: '3' },
    // Otras opciones si las tienes
  ];

  data: any[] = [];
  articlesUrl = ""; 
  urlFavorites = apiServer.url;
  next: string = "";
  previous: string = "";
  count: number =0;
  opcionSeleccionada: any;

  constructor(private articlesService: ArticlesService) {

    //EFC: Esto es para tener un delay al escribir en el texto para buscar
    this.textoCambios.pipe(
      debounceTime(2000), // Tiempo de espera en milisegundos
      distinctUntilChanged() // Solo emite si el valor cambió
    ).subscribe(() => {
      this.resetFiltro();
      this.getData(this.articlesUrl);

      if(this.count ==0)
      {
      this.mostrarNoHayRegistros = true;
      console.log("cero registros");
      }
      else{
      this.mostrarNoHayRegistros = false;
      console.log("con registros");
      }
    });
    
  }

  getData(url: string) {    
    this.mostrarNoHayRegistros = false;
    this.mostrandoSpinner = true;

    this.articlesService.findArticlesFav(url).subscribe(response => {
          
      //EFC: Asigno los resultados a la variable data 
      this.data = response.results;
      this.count = response.count;
      this.next = response.next;
      this.previous = response.prev;

      console.log("Count:" + this.count);
      console.log("data:" + response.results);
      console.log("next:" + response.next);
      console.log("previous:" + response.prev);

      if(this.count ==0)
      {
        this.mostrarNoHayRegistros = true;
        console.log("cero registros");
      }
      else{
        this.mostrarNoHayRegistros = false;
        console.log("con registros");
      }

    });

    this.mostrandoSpinner = false;
        
  }

  ngOnInit(): void {
    // On component initialization, load the properties on the page
    this.resetFiltro();
    this.getData(this.articlesUrl);
  }

  // function fetches the next paginated items by using the url in the next property
  fetchNext() {
    this.getData(this.next);
  }

  // function fetches the previous paginated items by using the url in the previous property
  fetchPrevious() {
    this.getData(this.previous);
  }

  addFavoritos(id: number, 
              title: String,
              summary: String,
              newssite: String,
              publishedat: String,
              favoritedat: String,
              accion: string) {

    if (accion=="add"){

      console.log("ID para add favoritos:" + id + " acción:" + accion);
    
      this.miJSON = {
        idoriginal: id,
        title: title.toString(),
        summary: summary.toString(),
        newsSite: newssite.toString(),
        publishedAt : publishedat.toString(),
        favoritedAt : publishedat.toString()
      };

       // Convierte el objeto JSON a una cadena JSON
      const jsonString = JSON.stringify(this.miJSON);

      console.log("jsonString para post:" + jsonString);
     
      this.articlesService.postArticlesFav('articles', jsonString).subscribe((response: any) => {
        console.log(response);    
      })
    }

    if (accion=="remove"){

      console.log("ID para remove favoritos:" + id + " acción:" + accion);

      this.articlesService.deleteArticlesFav(id).subscribe((response: any) => {
        console.log(response);        
      })
    }
    

  }


  resetFiltro() {
    this.mostrarNoHayRegistros = false;
    //EFC: Pendiente, cambiar a configurable  url: 'http://localhost:8080/api/'
    this.articlesUrl = this.urlFavorites + "pagedarticledtitle?offset=0&limit="+ this.cantPages +"&title="+this.filtroTitulo+"&sort=favoritedAt,desc"; //url to query for the properties        
  }

  onSelect($event: any) {
    console.log('cambio en el list');
    console.log(this.cantPages);    
    this.mostrarNoHayRegistros = false;
    //EFC: Resetar el filtro para partir de nuevo con nueva paginación, mejorar esto.
    this.resetFiltro();    
    this.getData(this.articlesUrl);    
  }

  onTextoChange(nuevoTexto: string) {
    console.log('Texto cambiado:', this.filtroTitulo);        
    //EFC: Resetar el filtro para partir de nuevo con nueva paginación, mejorar esto.
    this.mostrarNoHayRegistros = false;
    this.textoCambios.next(nuevoTexto);
  } 

}
