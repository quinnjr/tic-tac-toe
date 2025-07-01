import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tic-tac-toe/tic-tac-toe.component').then(m => m.TicTacToeComponent)
  }
];
