# IMILearn
Aplikacija za lako učenje. 

Aplikacija omogućava studentima da uče, vežbaju, prate kolokvijume i ispite, njihove poene i krajnje ocene na jednom mestu.
Postoje 3 role - ADMIN, STUDENT, PROFESOR.

**POKRETANJE:**

1. u backend .env.example i backend .env dodati API ključ za Open Router kako bi kreiranje kvizova radilo uz pomoć AI-a.
2. cd frontend
3. npm install
4. cd ..
5. ./start.sh
- Frontend: http://localhost:5173
- Backend:  http://localhost:8080

*Testovi*

**backend**
./mvnw test

**frontend**
npx playwright install chromium
npm run test:e2e
npx playwright test --headed --workers=1

**OPIS STRANICA**:
Stranica *Dashboard* je glavna stranica za svakog korisnika. Na njoj se nalaze najbitnije i osnovne stvari po sledećem rasporedu:
1. Admin - vidi *user administration* i *subject administration* kartice sa kojih može pristupiti svojim glavnim aktivnostima.
2. Profesor - vidi *subject list* kartice gde ima osnovni pregled predmeta koje drži, kao i *Scheduled Exams* karticu gde ima pregled kolokvijuma i ispita koje je zakazao.
3. Student - vidi isto što i profesor, s tim što ima karticu *Recently viewed materials* gde ima pregled poslednje gledanih materijala.

Stranica *Subject* ima za sve role isti pregled - listu kartica predmeta.

Stranica *Exams* ima sličan pregled za sve role. Dodatno, profesor može da dodaje novi kolokvijum ili ispit, da ga menja, briše, kao i da pregleda i dodaje poene.

Stranica *Quizzes* postoji samo kod studenta. Na njoj se na početku nalazi izbor predmeta za koji mogu da se vide ili rade kvizovi, nakon izabranog predmeta izlistavaju se postojeći kvizovi koji se mogu nastaviti ili ponoviti. Kvizovi se mogu kreirati putem opcije ručnog kreiranja ili kreiranjem uz pomoć AI-a.
Kreiranje uz pomoć AI-a se koristi tako što se dodaju željeni materijali iz željenog predmeta sa brojem pitanja, potom AI generiše traženi broj pitanja na koje student odgovara kako bi vežbao za kolokvijum i ispit.

Stranica *My Scores* takođe postoji samo kod studenta. Ona prikazuje listu poena i ocena na kolokvijumima i ispitima, kao i listu prethodnih pokušaja kviza i njihove uspešnosti.

U *header-u* ove aplikacije se nalazi ime i prezime ulogovanog korisnika, gde klikom dobijamo dodatne informacije za studenta - indeks, espb, godinu, prosek, a za sve korisnike, bez obzira na rolu, imamo log out opciju. 

**Notifikacije** postoje za sve korisnike. 
1. Admin - dobija notifikacije da o aktivnostima na predmetu.
2. Profesor - dobija notifikacije o aktivnostima na predmetu, forumu.
3. Student - dobija notifikacije o domaćim zadacima, kolovkijumima i ispitima, kao i notifikacije o aktivnostima na forumu, predmetu.

**OPIS ROLA:**

*Admin* ima mogućnost da upravlja svim funkcionalnostima ove aplikacije i može da obavlja sledeće aktivnosti:
1. Kreira, menja i briše predmet.
2. Kreira, menja i briše određenog korisnika.
3. Dodaje korisnike na predmet, kao i da ih briše sa predmeta.
4. Upravlja materijalima, testovima, domaćim zadacima na predmetu.

*Profesor* može da obavlja sledeće aktivnosti:
1. Kreira, menja i briše predmet.
2. Upravlja svim materijalima, testovima i domaćim zadacima na predmetu.
3. Dodaje poene, ocenjuje studenta na domaćem zadatku, kolokvijumu ili ispitu.
4. Zakazuje, menja, briše kolokvijum ili ispit.
5. Dodaje, menja i briše svoje komentare na forumu.

*Student* može da obavlja sledeće aktivnosti:
1. Pregleda sve materijale, testove i domaće zadatke (kao i da ih preda) na predmetu.
2. Pregleda poene na domaćim zadacima, kolokvijumima i ispitima.
3. Pregleda vreme i datum kolikvijuma i ispita.
4. Dodaje, menja i briše svoje komentare na forumu.

**TEHNOLOGIJE:**

*FRONTEND:*

React + TypeScript
Vite
Tailwind CSS
shadcn UI components
React Router
TanStack React Query
Axios
React Hook Form
STOMP/SockJS 

*BACKEND:*

Java Spring Boot
Spring Web MVC
Spring Security + JWT authentication
Spring Data JPA / Hibernate
PostgreSQL
Liquibase database migrations
WebSocket/STOMP notifications
Amazon S3 SDK, Garage, S3-compatible file storage
OpenRouter integration za kreiranje AI kviza

*TESTING:*

JUnit
Mockito
Playwright

*DEPLOYMENT:*

Docker and Docker Compose
Environment variables .env
Bash startup skripta (start.sh) koja pokreće Docker services, backend i frontend zajedno
npm/Vite for frontend build and development server
