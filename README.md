# 🖥 MIS - BACKEND

O **MIS (Management Information System)** é o principal sistema de informação gerencial da **RAMAX-GROUP**, responsável por centralizar o processamento de dados estratégicos, operacionais e analíticos para apoio à tomada de decisão, auditoria, compliance e visão executiva.

---

## 🛠 Tecnologias

- **Runtime:** Node.js 20.18
- **Package Manager:** NPM 10.8
- **Linguagem:** TypeScript
- **Framework:** NestJS
- **ORM:** TypeORM
- **Banco de Dados:** PostgreSQL

---

## 🎯 Escopo do MIS

O backend do MIS foi projetado para atender demandas **gerenciais e estratégicas**, indo além de um sistema transacional tradicional.

Abrange:

- **Gerencial:** visões por departamento e indicadores operacionais
- **Auditoria:** monitoramento, rastreabilidade e controle
- **Executiva:** KPIs e visão consolidada da operação
- **Compliance & GRC:** intranet, políticas internas, treinamentos e integrações

---

## 🗂 Arquitetura e Organização

O projeto segue a arquitetura modular recomendada pelo **NestJS**, com separação clara por domínio de negócio.

```
src
├── config                  # Configurações globais (env, database, providers)
├── core                    # Infraestrutura e código base compartilhado
│                           # (guards, interceptors, decorators, pipes, base classes)
├── modules                 # Módulos principais do sistema (domínios)
│   ├── auth
│   ├── <modulo>
│   │   ├── dto             # DTOs (entrada/saída)
│   │   ├── entities        # Entidades TypeORM
│   │   ├── controllers     # Controllers HTTP
│   │   ├── services        # Regras de negócio
│   │   └── <modulo>.module.ts
├── shared                  # Código compartilhado externamente (ex: integrações via ApiKey)
│   ├── modulo compartilhado
│   └── shared.module.ts
├── app.module.ts           # Módulo raiz da aplicação
├── app.controller.ts       # Controller raiz
└── main.ts                 # Bootstrap da aplicação

```

Cada módulo é responsável por um domínio funcional específico e contém seus **controllers, services, DTOs, entities e queries**.

---

## 🔐 Fluxos Principais

- **Autenticação via JWT** para usuários
- **Autenticação via API Key** para integrações externas
- Pipeline padrão: request → guards → interceptors → controller → service → database

---

## 📚 Glossário Rápido

- **business-audit:** auditoria e monitoramento
- **business-summary:** consolidação e resultados da operação
- **cash-flow:** simulações financeiras e fluxo de caixa
- **finance:** financeiro e contabilidade
- **freights:** custos e gestão de fretes
- **intranet:** compliance, políticas e conteúdos internos
- **sales / purchases / stock:** vendas, compras e estoque

---
