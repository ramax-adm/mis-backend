<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

### 🖥 MIS - BACKEND

Este projeto trata-se do MIS, principal sistema de informação gerencial da RAMAX-GROUP, este projeto é um DUMP do seguinte projeto <a href="https://github.com/lov1sk/ramax-backend" target="blank">RAMAX BACKEND</a>

### 🛠 Specs

- Node 20.18
- Npm 10.8
- Typescript
- NestJS
- TypeORM

### Estrutura

Core:

- Processamento de dados => BE NestJS

Jobs:

- Sync ERP x LOCAL Jobs
- OneOff Jobs
- Lake Jobs

Observabilidade:

- AzureLog -> Gerenciado pelo azure functions & correlatos (ISSO DAQUI LOGA APENAS DADOS DO AZURE)
- AuthLog -> Baseado em eventos de authenticação (LOGIN, LOGOUT, REFRESH) (ISSO DAQUI LOGA APENAS EVENTO DE AUTH)
- AuditLog -> Log baseado em evento, por exemplo criar alguma coisa, remover..... (Nao preciso disso agora)
- ProcessJobLog -> Log de processamentos externos... (ISSO DAQUI LOGA INFO SOBRE JOB ASYNCRONOS)
- ObservabilityLog -> Log baseado console oferecido a uma plataforma de observabilidade (ISSO AQUI LOGA TUDO DO BACKEND)

-> Onde eu colocaria aqui logs algumas feats asincronas, como upload de arquivo e process status... ou processamento pessado de algo em outro lugar que eu pudesse ver o status...
-> Eu gostaria de monitorar eventualmente alguns processos que eu inicio pelo front-end para dar feedback para o pessoal..
┌────────────────────────────┐
│ Request │
│ (API / Worker) │
└──────────┬─────────────────┘
│
┌───────────────┴────────────────────┐
│ │
Observabilidade Auditoria

(tecnológica) (de negócio)
│ │
Winston / OTEL → Grafana / Loki EventEmitter → AuditLogService → DB
│ │
→ Traces, métricas, erros → Logs imutáveis e versionados

[HTTP Request]
│
▼
AccessLogInterceptor → Observability logs (Winston + OTEL)
│
▼
Controller → Service → Evento de Domínio
│
▼
EventEmitter → AuditLogListener
│
▼
AuditLogService.save()
│
▼
Postgres (audit_logs)
