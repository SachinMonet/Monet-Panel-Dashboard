import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Login {

 filterBySearch<T extends object>(data: T[], search: string): T[] {
    if (!search) {
      return data;
    }

    const term = search.toLowerCase().trim();

    return data.filter((item) =>
      Object.values(item).some((value) => {
        if (value === null || value === undefined) return false;

        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
        ) {
          return value.toString().toLowerCase().includes(term);
        }

        return false;
      })
    );
  }


}
