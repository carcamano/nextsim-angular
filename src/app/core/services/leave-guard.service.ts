import {Location} from '@angular/common';
import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  NavigationStart,
  Router,
  RouterStateSnapshot
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LeaveGuardService implements CanActivate, CanActivateChild {

  lastTrigger: string;

  constructor(
    private router: Router,
    private location: Location,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.lastTrigger = event.navigationTrigger;
      }
    });
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.lastTrigger === 'popstate') {
      childRoute.data = {...childRoute.data, backing: true};
      this.location.go(state.url);
    }
    return true;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return true;
  }
}
