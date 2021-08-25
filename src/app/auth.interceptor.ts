import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import * as myVariables from './variables';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, 
             next: HttpHandler): Observable<HttpEvent<any>> {
        
        const jwtToken = myVariables.jwt;

        if(jwtToken != "") {
            const cloned = req.clone({
                headers: req.headers.set("Authorization", "Bearer " + jwtToken)
            });

            return next.handle(cloned);

        } else {
            return next.handle(req);
        }
    }
}