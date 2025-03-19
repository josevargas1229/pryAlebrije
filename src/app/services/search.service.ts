import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly searchSubject = new BehaviorSubject<string>('');
  search$ = this.searchSubject.asObservable();

  setSearchText(text: string) {
    this.searchSubject.next(text);
  }
}
