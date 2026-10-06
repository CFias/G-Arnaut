# Regras do Firestore — proposta (NÃO aplicada)

O redesign funciona com as regras atuais, mas dois recursos novos só gravam
dados se as regras permitirem. Sem a mudança, o site segue normal e esses
registros simplesmente não acontecem (os erros são ignorados em silêncio).

| Recurso | O que precisa | Onde aparece |
|---|---|---|
| Leads | `create` público na coleção `leads`; leitura/edição só admin | Painel → Leads, KPIs da visão geral |
| Visualizações / contagem de leads | visitante poder **apenas incrementar** `views` e `leadsCount` em `products` | Painel → colunas Views/Leads, "Mais vistos" |

Revise antes de publicar (Firebase Console → Firestore → Regras). Os UIDs
abaixo são os mesmos de `src/config/adminUsers.js`.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null && request.auth.uid in [
        'SCQFrh1l7iVOKNbsInx0JGgT9ww1',
        'KduymIJGpXciGs7UlcN3uylAXBZ2'
      ];
    }

    // Só os contadores mudam, e só de 1 em 1
    function isCounterBump() {
      let changed = request.resource.data.diff(resource.data).affectedKeys();
      return changed.hasOnly(['views', 'leadsCount'])
        && (!changed.hasAny(['views']) || request.resource.data.views == resource.data.get('views', 0) + 1)
        && (!changed.hasAny(['leadsCount']) || request.resource.data.leadsCount == resource.data.get('leadsCount', 0) + 1);
    }

    match /products/{id} {
      allow read: if true;
      allow create, delete: if isAdmin();
      allow update: if isAdmin() || isCounterBump();
    }

    match /leads/{id} {
      allow create: if request.resource.data.keys().hasOnly(
          ['name', 'phone', 'productId', 'productTitle', 'productCode', 'source', 'message', 'stage', 'createdAt'])
        && request.resource.data.stage == 'Novo'
        && request.resource.data.name is string && request.resource.data.name.size() <= 120
        && request.resource.data.message is string && request.resource.data.message.size() <= 1000;
      allow read, update, delete: if isAdmin();
    }

    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }

    // Coleções antigas — mantenha aqui as regras que você já usa hoje
    // para posts, featured_products, imoveis e videos.
  }
}
```

> ⚠️ Se as suas regras atuais forem diferentes para `users`, `posts`,
> `featured_products`, `imoveis` ou `videos`, mantenha as suas — copie só os
> blocos `products` e `leads`.

A consulta de leads usa `orderBy("createdAt", "desc")` em um único campo, que
não precisa de índice composto.
