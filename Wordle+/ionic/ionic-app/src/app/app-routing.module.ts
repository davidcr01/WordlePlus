import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'classic-wordle/:length',
    loadChildren: () => import('./pages/classic-wordle/classic-wordle.module').then( m => m.ClassicWordlePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-user',
    loadChildren: () => import('./pages/edit-user/edit-user.module').then( m => m.EditUserPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'friendlist',
    loadChildren: () => import('./pages/friendlist/friendlist.module').then( m => m.FriendlistPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'create-game',
    loadChildren: () => import('./pages/create-game/create-game.module').then( m => m.CreateGamePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'respond-game',
    loadChildren: () => import('./pages/respond-game/respond-game.module').then( m => m.RespondGamePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'history',
    loadChildren: () => import('./pages/history/history.module').then( m => m.HistoryPageModule),
    canActivate: [AuthGuard]
  },

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
