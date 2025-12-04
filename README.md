# Frontend: Lista de Tarefas (TaskDash)

Front-end simples em HTML/CSS/JavaScript para consumir um backend Spring Boot (H2) que fornece uma API REST de tarefas.

Como usar
- Coloque os arquivos neste diretório (já adicionados): `index.html`, `styles.css`, `app.js`.
- Abra `index.html` no navegador (ou sirva via um servidor estático).
- Ajuste a variável `BASE_URL` no início de `app.js` caso seu backend não rode em `http://localhost:8080`.

Assunções da API
- GET  /api/tasks           => lista de tarefas (JSON array)
- POST /api/tasks           => cria tarefa (body {title, completed}) retorna objeto criado
- PUT  /api/tasks/{id}      => atualiza tarefa (body JSON) retorna objeto atualizado
- DELETE /api/tasks/{id}    => deleta, retorna 200/204

Exemplo de formato de tarefa (JSON):

{
  "id": 1,
  "title": "Comprar leite",
  "completed": false
}

Notas
- Se seu backend usar rotas diferentes, altere `API_PREFIX` ou `BASE_URL` em `app.js`.
- O front não exige compilação. Para desenvolvimento com CORS habilitado no Spring Boot, certifique-se de permitir `http://localhost:5500` (ou a origem que usar) ou use o mesmo host/porta.

Melhorias possíveis
- Paginação
- Ordenação por data
- Campos adicionais (descrição, prioridade, data)
- Melhor tratamento de erros e feedback visual
