import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { endpoints } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor( private http: HttpClient) { }

  public getGlobalData(): Observable<any> {
    return this.http.get('https://raw.githubusercontent.com/andybarefoot/andybarefoot-www/master/maps/mapdata/custom50.json').pipe(
      tap(data => console.log('fetched country data')),
      catchError(this.handleError('getGlobalData', []))
    );
  }

  public getTopicCount(topic: string): Observable<any> {
    if (!topic.trim()) {
      return of([]);
    }

    return this.http.get(`${endpoints.knowledgeMapApi}/topics/${topic}`).pipe(
      tap(data => console.log('fetched topics data')),
      catchError(this.handleError('getTopicCount', []))
    );
  }

    /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
 
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
 
      // TODO: better job of transforming error for user consumption
      //this.log(`${operation} failed: ${error.message}`);
 
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
