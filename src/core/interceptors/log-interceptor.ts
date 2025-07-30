import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    console.log('\n==== Auth ====');
    console.log(`Executando ${request.method} - ${request.url}`);

    const user = request?.user;
    let msg = '';
    if (!user) {
      msg = `Sem usuario logado!`;
    } else {
      msg = `Usuario: ${request?.user?.id} - ${request?.user?.role} - ${request?.user?.name}`;
    }
    console.log(msg);
    console.log('====================');

    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`Finalizado em ... ${Date.now() - now}ms`)));
  }
}
