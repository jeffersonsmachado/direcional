# Sistema de venda de apartamentos

## Rodando o projeto

O projeto roda em docker. Para subir os containers use o comando:

> docker compose up --build -d

Isso disponibilizará os ambientes nas seguintes URLs:

Frontend

> http://localhost:3000/

Backend

> http://localhost:8080/swagger/index.html

Banco de Dados

> http://localhost:1433/

## API

Exemplos da API

### GET /apartamentos

Permissão Exigida: Admin, Corretor, Comum

Parâmetros de Query:

> pageNumber (opcional, padrão = 1)

> pageSize (opcional, padrão = 10)

Exemplo de Resposta (200 OK):

```JSON
{
"items": [
	{
	"id": "_ID_",
	"numero": "101",
	"bloco": "A",
	"andar": 1,
	"area": 45.5,
	"valor": 250000.00,
	"status": "Disponível"
	}
],
"totalCount": 150,
"pageNumber": 1,
"pageSize": 10,
"totalPages": 15,
"hasPreviousPage": false,
"hasNextPage": true
}
```

### POST /usuarios/auth/login

Realiza o login no sistema e retorna o token JWT assim como o perfil do usuário

Permissão Exigida: nenhuma

Exemplo de Requisição (Body):

```JSON
{
  "email": "admin@direcional.com",
  "senha": "Admin@123"
}
```

Exemplo Resposta

```JSON
{
  "token": {
    "token": "_TOKEN_",
    "perfil": "Admin"
  }
}
```

### POST /clientes

Cria o registro de um proponente para futuras negociações.

Permissão Exigida: Admin, Corretor

Exemplo de Requisição (Body):

```JSON
{
"nome": "Maria Silva",
"cpf": "11122233344",
"email": "maria@email.com",
"telefone": "11999999999"
}
```

> Resposta (201 Created): Retorna o ID do cliente criado (Guid).

### POST /apartamentos

Cria um novo apartamento e o coloca disponível para venda.

Permissão Exigida: Admin, Corretor

Exemplo de Requisição (Body):

```JSON
{
  "numero": "11",
  "bloco": "D",
  "andar": 4,
  "area": 50.5,
  "valor": 1000000
}
```

Exemplo resposta

```JSON
{
  "id": "_0000_ID_0000_"
}
```

### PATCH /reservas/{id}/observacoes

Atualiza as observações e anotações de negociação de uma reserva específica.

Permissão Exigida: Admin, Corretor

Exemplo de Requisição (Body):

```JSON
{
"observacoes": "NOVA OBSERVAÇÃO A SER INSERIDA"
}
```

> Resposta (204 No Content): Sucesso na atualização, sem conteúdo no retorno.

## Banco de Dados

Apartamentos

- Id (uniqueidentifier) PK
- Numero (nvarchar(20))
- Bloco (nvarchar(10))
- Andar (int)
- Area (decimal(18,2))
- Valor (decimal(18,2))
- Status (int)

Clientes

- Id (uniqueidentifier) PK
- Nome (nvarchar(200))
- CPF (nvarchar(14))
- Email (nvarchar(200))
- Telefone (nvarchar(20))

Perfil

- Id (uniqueidentifier) PK
- Nome (nvarchar(100))

Reservas

- Id (uniqueidentifier) PK
- ApartamentoId (uniqueidentifier) FK
- ClienteId (uniqueidentifier) FK
- DataReserva (datetime2)
- DataExpiracao (datetime2)
- Status (int)
- Observacoes (nvarchar(max))

Usuarios

- Id (uniqueidentifier) PK
- Nome (nvarchar(200))
- Email (nvarchar(200))
- SenhaHash (nvarchar(128))
- PerfilId (uniqueidentifier) FK

Vendas

- Id (uniqueidentifier) PK
- ApartamentoId (uniqueidentifier) FK
- ClienteId (uniqueidentifier) FK
- ReservaId (uniqueidentifier) FK
- DataVenda (datetime2)
- ValorVenda (decimal(18,2))
- Status (int)

## Token JWT

O token JWT é gerado ao realizar login. Utilize a rota /usuarios/auth/login para logar no sistema.

Após o login, é necessário usar o token que foi gerado no cabeçalho Authorization com o valor "Bearer _TOKEN_".

## Considerações técnicas

O padrão Mediator Pattern foi escolhido utilizando o MediatR por ser mais próximo do padrão da indústria, mantendo o código desacoplado e ser de fácil manutenção.
