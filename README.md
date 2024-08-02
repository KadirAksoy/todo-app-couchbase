# TODO Uygulamasi

## Gereksinimler

Başlamadan önce bilgisayarınızda aşağıdakilerin kurulu olduğundan emin olun:

- [Node.js ve npm](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [React.js](https://react.dev/)
## Kurulum Talimatları
Projeyi kopyalayın 

```
git clone https://github.com/KadirAksoy/todo-app-couchbase
```

Docker dosyasını çalıştırın:

```
docker compose up
```

Tarayıcı üzerinden aşağıdaki adres ile couchbase database panelini açabiliriz:

```
http://localhost:8091
```

Ardından dosyalara ayrı ayrı girin

```
cd .\api-gateway\
cd .\todo-service\
cd .\auth-service\
cd .\todo-react\
```

Her dosyaya girdiğinizde şu komutları çalıştırın:
```
npm install

npm run dev
```
Servisler çalışacaktır.

## Servisler

### Auth Servis

Auth servis kullanicinin login, register, refreshtoken gibi requestlerini karsilayacak servistir. Kendine ait bir noSQL (Couchbae) database'i vardir. Sadede gateway uzerinden gelen istekleri yanitlar.

#### Data Models

**User**:

```ts
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  lastname: string;
  todos: Todo[];
}
```

#### Endpoints

Her endpoint `/auth` on ekine sahip olmalidir.

- /signup - POST
  - Kullanicidan alinan bilgileri kontrol eder ve database'e kaydeder.
- /signin - POST
  - Kullanici adiyla database'e request atar.
  - Donen datanin parolasiyla kullanicinin girdigi parolayi karsilastirir.
  - Kullanicinin datasiyla birlikte jwt formatinda access ve refresh token doner.
  - Access token'in TLL' i 1 dakikadir.
  - Refres token'in TTL' i yok.
- /refreshtoken - POST
  - Refresh token uzerinden yeni bir access token olusturulup kullaniciya dondurulur.

  ### Todo Servis

  Todo servis todolarin crud islemlerini yapan servisimizdir. Sadece gateway uzerinden gelen requestlere yanit verir.

  #### Data Models

**Todo**:

```ts
interface Todo {
  id: number;
  text: string;
  author: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Endpoints

Her enpoint `/todo` on ekine sahib olmalidir.

- /create- POST
  - Yenibir todo ekler

- /delete/:id - DELETE
  - ID' si eslesen todoyu siler
 
- /getTodo:id - GET
  - ID ile eslesen todoyu getirir.

- /getAll- GET
  - Butun todoları getirir.

- /getAllCompleted- GET
  - Tamamlanmış todoları getirir.

- /getNotCompleted- GET
  - Tamamlanmamış todoları getirir
    
- /update/:id - Put
  - Toduyu günceller

### Gateway Servis

Gateway servis gelen requestleri endpointlerindeki on eke gore ilgili servislere yonlendirir. Secure end pointler icin auth middleware ile access token (JWT) offline olarak verify eder.
Çalışma şekli şu şekildedir. Kullanıcı login olur. Login olduktan sonra bir accessToken ve refreshToken oluşturur. AccesToken'in geçerlilik süresi 1 dakikadır. RefreshToken'in geçerlilik 
süresi sınırsızdır. Kullanıcı login olduktan sonra user-id bilgisi header'a gönderilir ve todo servis user-id yi buradan alır. Ardından istekleri gerçekleştirebilir. RefreshToken ile
her 50 saniyede 1 accessToken yenilenir böylece kullanıcının uygulamayı kullandığı süre boyunca login olmasına gerek kalmaz.

##### Endpoints

- /api/auth/\*
  - Authentication Servisine yonlendirilir
- /api/todo/\*
  - Todo servisine yonlendirilir.

### Architecture

![architecture.png](https://uploads.inkdrop.app/attachments/user-28d8bf6ae780f83a9de255b95e12907f/file:4gdazvKbj/index-public)
