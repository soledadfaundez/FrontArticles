import { Component, OnInit } from '@angular/core';
import { ArticlesService } from '../../services/articles.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  private textoCambios = new Subject<string>();
  variableLocal: string = '';
  miJSON: any; // Variable para almacenar el JSON
  mostrandoSpinner: boolean = false; //EFC: Para spinner
  mostrarNoHayRegistros: boolean = false; //EFC: Para spinner

 
  cantPages: string="10"; // O el tipo adecuado para tu caso
  filtroTitulo: string=""; 

  optionsCantPages = [
    { value: '10', label: '10' },
    { value: '5', label: '5' },
    { value: '3', label: '3' },
    // Otras opciones si las tienes
  ];

  data: any[] = [];
  articlesUrl = "";
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

    this.articlesService.getArticles(url).subscribe(response => {

      //EFC: Asigno los resultados a la variable data 
      this.data = response.results.map((item: any) => {
        // Agregar un nuevo campo 'nuevoCampo' a cada elemento de results
        return { ...item, EnFavoritos: 'false', botonAgrega: true, botonRemueve: false}; // Puedes ajustar 'valorPorDefecto' según lo que necesites
      });
      this.count = response.count;
      this.next = response.next;
      this.previous = response.previous;

      //console.log("Count:" + this.count);
      //console.log("data:" + response.results);

      this.data.forEach((item) => {

        this.articlesService.getArticlesFav(item.id).subscribe((response: any) => {
        
          item.botonAgrega= true; 
          item.botonRemueve= false;

          console.log("verificarFavoritos response" + response.idoriginal);
          if (response.idoriginal.toString() === item.id.toString())
          {
            item.EnFavoritos = 'true';   
            item.botonAgrega= false; 
            item.botonRemueve= true;
          }
          else {
            item.EnFavoritos = 'false';     
            item.botonAgrega= true; 
            item.botonRemueve= false;
          }
        })

       
      });

      if(this.count ==0)
      {
        this.mostrarNoHayRegistros = true;
        //console.log("cero registros");
      }
      else{
        this.mostrarNoHayRegistros = false;
        //console.log("con registros");
      }

    });

    this.mostrandoSpinner = false;
    //console.log("Count no hay registros:" + this.count);
    
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

  verificarFavoritos(numero: number): string {
    
    let res = '';
    console.log("verificarFavoritos:" + numero);

    this.articlesService.getArticlesFav(numero).subscribe((response: any) => {
        
      console.log("verificarFavoritos response" + response.idoriginal);
      if (response.idoriginal.toString() === numero.toString())
      {
        //console.log("verificarFavoritos true:" + numero + " .. " + response.idoriginal.toString() );
        res = numero.toString();        
      }
      else {
        //console.log("verificarFavoritos false:" + numero + " .. " + response.idoriginal.toString() );
        res = '0';       
      }
    })
    return res; 
   
  }

  resetFiltro() {
    this.mostrarNoHayRegistros = false;
    this.articlesUrl = "https://api.spaceflightnewsapi.net/v4/articles/?limit="+ this.cantPages +"&offset=0&ordering=published_at desc&title_contains=" + this.filtroTitulo; //url to query for the properties        
  }

  onSelect($event: any) {
    console.log('cambio en el list');
    console.log(this.cantPages);
    console.log(this.articlesUrl);

    this.mostrarNoHayRegistros = false;
    //EFC: Resetar el filtro para partir de nuevo con nueva paginación, mejorar esto.
    this.resetFiltro();    
    this.getData(this.articlesUrl);
    // Aquí puedes hacer lo que necesites con el valor seleccionado
  }

  onTextoChange(nuevoTexto: string) {
    //console.log('Texto cambiado:', this.filtroTitulo);
    // Puedes hacer lo que necesites con el nuevo valor del texto aquí
    //console.log(this.cantPages);
    //console.log(this.articlesUrl);

    //EFC: Resetar el filtro para partir de nuevo con nueva paginación, mejorar esto.
    this.mostrarNoHayRegistros = false;

    this.textoCambios.next(nuevoTexto);
  }

  botonPresionadoAgrega(fila: any) {
    // Aquí puedes realizar cualquier lógica necesaria cuando el botón sea presionado
    // Por ejemplo, cambiar otras propiedades o realizar una acción
    fila.botonAgrega = false; // Ocultar el botón de la fila actual
    fila.botonRemueve = true; // Ocultar el botón de la fila actual

    this.miJSON = {
      idoriginal: fila.id,
      title: fila.title.toString(),
      summary: fila.summary.toString(),
      newsSite: fila.news_site.toString(),
      publishedAt : fila.published_at.toString(),
      favoritedAt : fila.published_at.toString()
    };

     // Convierte el objeto JSON a una cadena JSON
    const jsonString = JSON.stringify(this.miJSON);

    //console.log("jsonString para post:" + jsonString);
   
    this.articlesService.postArticlesFav('articles', jsonString).subscribe((response: any) => {
      console.log(response);    
    })

  }
  botonPresionadoRemueve(fila: any) {
    // Aquí puedes realizar cualquier lógica necesaria cuando el botón sea presionado
    // Por ejemplo, cambiar otras propiedades o realizar una acción
    fila.botonAgrega = true;
    fila.botonRemueve = false; // Ocultar el botón de la fila actual

    this.articlesService.deleteArticlesFav(fila.id).subscribe((response: any) => {
      //console.log(response);        
    })
    
  }
}
