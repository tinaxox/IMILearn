import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "sr";

const STORAGE_KEY = "imilearn.lang";

type TranslationDict = Record<string, unknown>;

const en = {
  common: {
    dashboard: "Dashboard",
    quiz: "Quiz",
    profile: "Profile",
    admin: "Admin",
    logout: "Logout",
    signOut: "Sign out",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    submit: "Submit",
    loading: "Loading…",
    error: "Error",
    close: "Close",
    add: "Add",
    create: "Create",
    post: "Post",
    back: "Back",
    backToDashboard: "Back to dashboard",
    year: "Year",
    notifications: "Notifications",
    noNewNotifications: "No new notifications.",
    dragToResize: "Drag to resize",
  },
  roles: {
    admin: "Admin",
    professor: "Professor",
    assistant: "Assistant",
    student: "Student",
  },
  language: {
    label: "Language",
    english: "English",
    serbian: "Srpski",
  },
  nav: {
    dashboard: "Dashboard",
    quiz: "Quiz",
    profile: "Profile",
    admin: "Admin",
  },
  notFound: {
    title: "Page not found",
    description: "The page you're looking for doesn't exist or has been moved.",
    goHome: "Go home",
  },
  errorPage: {
    title: "This page didn't load",
    description: "Something went wrong on our end. You can try refreshing or head back home.",
    tryAgain: "Try again",
    goHome: "Go home",
  },
  auth: {
    noAccountWithEmail: "No account with that email. Try admin@imi.edu, prof@imi.edu, asst@imi.edu, or marko@imi.edu.",
    emailTaken: "Email is already taken.",
  },
  login: {
    signIn: "Sign in",
    welcomeBack: "Welcome back. Use any seed email to explore.",
    email: "Email",
    password: "Password",
    signingIn: "Signing in...",
    noAccount: "No account?",
    register: "Register",
    demoAccounts: "Demo accounts",
    loginFailed: "Login failed",
  },
  register: {
    title: "Create your student account",
    subtitle: "Professor and assistant accounts are created by an admin.",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    creating: "Creating...",
    createAccount: "Create account",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign in",
    passwordTooShort: "Password must be at least 6 characters.",
    passwordsDontMatch: "Passwords do not match.",
    registrationFailed: "Registration failed",
  },
  emptyState: {
    adminsOnly: "Admins only",
    adminsOnlyDescription: "This page is restricted to administrator accounts.",
    quizzesForStudents: "Quizzes are for students",
    quizzesForStudentsDescription: "Only student accounts can take practice quizzes.",
    nothingToQuiz: "Nothing to quiz on yet",
    nothingToQuizDescription: "Enroll in a subject to start practicing.",
    notEnrolled: "You're not enrolled in any subjects yet",
    notEnrolledDescription: "Once your professor enrolls you, subjects will show up here.",
    noSubjectsAssigned: "No subjects assigned yet",
    noSubjectsAssignedDescription: "An admin will assign subjects to your account.",
    noAccess: "You don't have access to this subject",
    noAccessDescription: "Ask an admin to enroll you if you think this is a mistake.",
    noEnrolledSubjects: "No enrolled subjects",
    noPracticeAttempts: "No practice attempts yet",
    noPracticeAttemptsDescription: "Head to Quiz to try one.",
    noQuizAttempts: "No quiz attempts yet",
    noQuizAttemptsDescription: "Attempts you take will appear here with your score.",
    noAssignments: "No assignments yet",
    noAssignmentsStaffDescription: "Post an assignment for your students.",
    noAssignmentsStudentDescription: "Your professor hasn't posted any assignments for this subject yet.",
    noTeams: "No teams yet",
    noTeamsDescription: "Students haven't created teams for this subject.",
  },
  dashboard: {
    welcomeBack: "Welcome back, {{name}}",
    todaysSummary: "Here's what's happening with your studies today.",
    subjects: "Subjects",
    allSubjects: "All subjects",
    yourSubjects: "Your subjects",
    subjectsYouTeach: "Subjects you teach",
    searchSubjects: "Search subjects…",
    createSubject: "Create subject",
    noSubjectsMatch: 'No subjects match "{{query}}".',
    upcomingTests: "Upcoming Tests",
    continueWhereYouLeftOff: "Continue Where You Left Off",
    nothingRecent: "Nothing recent yet.",
    latestScore: "Latest Score",
    materials: "Materials",
    upcoming: "Upcoming",
    newSubject: "New subject",
    subjectName: "Subject name",
    shortDescription: "Short description",
    lecture: "Lecture",
    exercise: "Exercise",
    quizItem: "Quiz",
    quizPractice: "{{type}} practice quiz",
  },
  quiz: {
    practiceQuiz: "Practice quiz",
    setupSession: "Set up a quick session. Results only count as practice.",
    subject: "Subject",
    examType: "Exam type",
    source: "Source",
    fromFolder: "From folder",
    aiGenerated: "AI generated",
    useUploadedFiles: "Use uploaded exam files.",
    noFilesAvailable: "No files available for this exam type.",
    freshQuestions: "Fresh questions every time.",
    startQuiz: "Start quiz",
    generatingQuestions: "Generating questions…",
    yourScore: "Your score",
    done: "Done",
    questionOf: "Question {{current}} of {{total}}",
    answeredCount: "{{answered}} / {{total}} answered",
    submitQuiz: "Submit quiz",
    startAQuiz: "Start a quiz",
    practiceQuizzes: "Practice quizzes",
    generateQuizzesDescription: "Generate quizzes from the exam pool or with AI.",
    aiGeneratedShort: "AI-generated",
    fromFolderShort: "From folder",
  },
  profile: {
    officialResults: "Official results",
    officialResultsDescription: "Grades entered by your professors and assistants.",
    quizPracticeHistory: "Quiz practice history",
    practiceOnly: "Practice only",
    doesntAffectGrade: "Doesn't affect your grade.",
    subject: "Subject",
    type: "Type",
    source: "Source",
    score: "Score",
    date: "Date",
    espb: "ESPB",
    scoreLabel: "Score",
    yearLabel: "Year",
  },
  admin: {
    panel: "Admin panel",
    subjects: "Subjects",
    enrolled: "{{count}} enrolled",
    createStaffAccount: "Create staff account",
    people: "People",
    name: "Name",
    email: "Email",
    role: "Role",
    subjectsColumn: "Subjects",
    firstNamePlaceholder: "First name",
    lastNamePlaceholder: "Last name",
    emailPlaceholder: "Email",
    enrollInSubject: "Enroll in subject…",
    noYearOrEarlierSubjects: "No year {{year}}-or-earlier subjects left",
    nothingLeftToAssign: "Nothing left to assign",
  },
  subject: {
    upcomingExams: "Upcoming Exams",
    noUpcomingExams: "No upcoming exams for this subject.",
    materials: "Materials",
    quizzes: "Quizzes",
    assignments: "Assignments",
    project: "Project",
    students: "Students",
    startAProject: "Start a project",
    lectures: "Lectures",
    exercises: "Exercises",
    midtermExams: "Midterm Exams",
    finalExam: "Final Exam",
    notFound: "Subject not found.",
    changeSubjectPicture: "Change subject picture",
  },
  materials: {
    addLecture: "Add lecture",
    addExercise: "Add exercise",
    newLecture: "New lecture",
    newExercise: "New exercise",
    title: "Title",
    choosePdfSlides: "Choose PDF/slides",
    noLecturesYet: "No lectures yet",
    noExercisesYet: "No exercises yet",
    lectureFilesDescription: "Lecture files will appear here once uploaded.",
    exerciseFilesDescription: "Exercise files will appear here once uploaded.",
    name: "Name",
    modified: "Modified",
    modifiedBy: "Modified By",
    nothingHereYet: "Nothing here yet.",
  },
  exam: {
    addPracticePool: "Add practice question pool",
    addMidterm: "Add midterm",
    addFinal: "Add final",
    newMidterm: "New midterm",
    newFinal: "New final",
    namePlaceholder: "Name (e.g. {{example}})",
    noMidtermMaterials: "No midterm materials yet",
    noFinalMaterials: "No final materials yet",
    practiceQuestionPool: "Practice question pool",
    noPracticePool: "No practice pool uploaded yet",
    enterPoints: "Enter points",
    enterPointsMidtermDescription: "Filled in by the assistant or professor.",
    enterPointsFinalDescription: "Filled in by the professor — this determines the final subject grade.",
    enterScores: "Enter scores",
    scorePlaceholder: "score",
    maxPlaceholder: "max",
  },
  assignment: {
    newAssignment: "New assignment",
    titlePlaceholder: "Title",
    instructionsPlaceholder: "Instructions",
    attachReferenceFile: "Attach reference file",
    multipleSubmissionsAllowed: "Multiple submissions allowed",
    singleSubmission: "Single submission",
    handedIn: "Handed in",
    notHandedIn: "Not handed in",
    instructions: "Instructions",
    referenceMaterials: "Reference materials",
    yourSubmission: "Your submission",
    submittedOn: "Submitted {{date}}",
    writeAnswer: "Write your answer (optional)",
    attachFile: "Attach file / image",
    handIn: "Hand in",
    handInAgain: "Hand in again",
    submissions: "Submissions ({{count}})",
    noSubmissionsYet: "No submissions yet.",
    dueDate: "Due {{date}} · ",
  },
  project: {
    members: "member",
    membersPlural: "members",
    uploadProjectFile: "Upload project file",
    addTeammate: "Add teammate…",
    noFilesUploaded: "No files uploaded yet.",
  },
  students: {
    student: "Student",
    total: "Total",
  },
  gradeTable: {
    exam: "Exam",
    points: "Points",
    max: "Max",
    noExamsRecorded: "No exams recorded.",
    total: "Total",
    finalGrade: "Final grade",
  },
  file: {
    uploadFile: "Upload file",
  },
  role: {
    guardHint: "",
  },
  fileTable: {
    name: "Name",
    modified: "Modified",
    modifiedBy: "Modified By",
  },
  scoreChip: {
    noScore: "No score",
  },
  notifications_ns: {
    newExam: "New exam scheduled: {{exam}} — {{subject}}",
  },
};

const sr: typeof en = {
  common: {
    dashboard: "Kontrolna tabla",
    quiz: "Kviz",
    profile: "Profil",
    admin: "Administracija",
    logout: "Odjava",
    signOut: "Odjavi se",
    save: "Sačuvaj",
    cancel: "Otkaži",
    delete: "Obriši",
    edit: "Izmeni",
    submit: "Pošalji",
    loading: "Učitavanje…",
    error: "Greška",
    close: "Zatvori",
    add: "Dodaj",
    create: "Kreiraj",
    post: "Objavi",
    back: "Nazad",
    backToDashboard: "Nazad na kontrolnu tablu",
    year: "Godina",
    notifications: "Obaveštenja",
    noNewNotifications: "Nema novih obaveštenja.",
    dragToResize: "Prevuci za promenu veličine",
  },
  roles: {
    admin: "Administrator",
    professor: "Profesor",
    assistant: "Asistent",
    student: "Student",
  },
  language: {
    label: "Jezik",
    english: "English",
    serbian: "Srpski",
  },
  nav: {
    dashboard: "Kontrolna tabla",
    quiz: "Kviz",
    profile: "Profil",
    admin: "Administracija",
  },
  notFound: {
    title: "Stranica nije pronađena",
    description: "Stranica koju tražite ne postoji ili je premeštena.",
    goHome: "Idi na početnu",
  },
  errorPage: {
    title: "Stranica nije učitana",
    description: "Došlo je do greške na našoj strani. Pokušajte da osvežite stranicu ili se vratite na početnu.",
    tryAgain: "Pokušaj ponovo",
    goHome: "Idi na početnu",
  },
  auth: {
    noAccountWithEmail: "Ne postoji nalog sa tom e-mail adresom. Probajte admin@imi.edu, prof@imi.edu, asst@imi.edu ili marko@imi.edu.",
    emailTaken: "Ova e-mail adresa je već zauzeta.",
  },
  login: {
    signIn: "Prijava",
    welcomeBack: "Dobrodošli nazad. Koristite bilo koju od unapred definisanih e-mail adresa za probu.",
    email: "E-mail",
    password: "Lozinka",
    signingIn: "Prijavljivanje...",
    noAccount: "Nemate nalog?",
    register: "Registruj se",
    demoAccounts: "Demo nalozi",
    loginFailed: "Prijava nije uspela",
  },
  register: {
    title: "Kreirajte studentski nalog",
    subtitle: "Naloge za profesore i asistente kreira administrator.",
    firstName: "Ime",
    lastName: "Prezime",
    email: "E-mail",
    password: "Lozinka",
    confirmPassword: "Potvrdite lozinku",
    creating: "Kreiranje...",
    createAccount: "Kreiraj nalog",
    alreadyHaveAccount: "Već imate nalog?",
    signIn: "Prijavite se",
    passwordTooShort: "Lozinka mora imati najmanje 6 karaktera.",
    passwordsDontMatch: "Lozinke se ne poklapaju.",
    registrationFailed: "Registracija nije uspela",
  },
  emptyState: {
    adminsOnly: "Samo za administratore",
    adminsOnlyDescription: "Ova stranica je dostupna samo administratorskim nalozima.",
    quizzesForStudents: "Kvizovi su namenjeni studentima",
    quizzesForStudentsDescription: "Samo studentski nalozi mogu da rade probne kvizove.",
    nothingToQuiz: "Trenutno nema materijala za kviz",
    nothingToQuizDescription: "Upišite se na predmet da biste počeli sa vežbanjem.",
    notEnrolled: "Još uvek niste upisani ni na jedan predmet",
    notEnrolledDescription: "Kada vas profesor upiše, predmeti će se pojaviti ovde.",
    noSubjectsAssigned: "Još uvek nema dodeljenih predmeta",
    noSubjectsAssignedDescription: "Administrator će dodeliti predmete vašem nalogu.",
    noAccess: "Nemate pristup ovom predmetu",
    noAccessDescription: "Ako mislite da je ovo greška, zamolite administratora da vas upiše.",
    noEnrolledSubjects: "Nema upisanih predmeta",
    noPracticeAttempts: "Još uvek nema probnih pokušaja",
    noPracticeAttemptsDescription: "Idite na Kviz da biste probali jedan.",
    noQuizAttempts: "Još uvek nema pokušaja kviza",
    noQuizAttemptsDescription: "Pokušaji koje uradite pojaviće se ovde sa vašim rezultatom.",
    noAssignments: "Još uvek nema zadataka",
    noAssignmentsStaffDescription: "Objavite zadatak za svoje studente.",
    noAssignmentsStudentDescription: "Vaš profesor još uvek nije objavio nijedan zadatak za ovaj predmet.",
    noTeams: "Još uvek nema timova",
    noTeamsDescription: "Studenti još uvek nisu napravili timove za ovaj predmet.",
  },
  dashboard: {
    welcomeBack: "Dobrodošli nazad, {{name}}",
    todaysSummary: "Evo šta se dešava sa vašim studijama danas.",
    subjects: "Predmeti",
    allSubjects: "Svi predmeti",
    yourSubjects: "Vaši predmeti",
    subjectsYouTeach: "Predmeti koje predajete",
    searchSubjects: "Pretraži predmete…",
    createSubject: "Kreiraj predmet",
    noSubjectsMatch: 'Nijedan predmet ne odgovara pretrazi "{{query}}".',
    upcomingTests: "Predstojeći ispiti",
    continueWhereYouLeftOff: "Nastavi tamo gde si stao",
    nothingRecent: "Trenutno nema skorašnjih aktivnosti.",
    latestScore: "Poslednji rezultat",
    materials: "Materijali",
    upcoming: "Predstojeće",
    newSubject: "Novi predmet",
    subjectName: "Naziv predmeta",
    shortDescription: "Kratak opis",
    lecture: "Predavanje",
    exercise: "Vežba",
    quizItem: "Kviz",
    quizPractice: "Probni kviz — {{type}}",
  },
  quiz: {
    practiceQuiz: "Probni kviz",
    setupSession: "Podesite kratku sesiju. Rezultati se računaju samo kao vežba.",
    subject: "Predmet",
    examType: "Tip ispita",
    source: "Izvor",
    fromFolder: "Iz fascikle",
    aiGenerated: "Generisano pomoću AI",
    useUploadedFiles: "Koristi otpremljene fajlove ispita.",
    noFilesAvailable: "Nema dostupnih fajlova za ovaj tip ispita.",
    freshQuestions: "Nova pitanja svaki put.",
    startQuiz: "Započni kviz",
    generatingQuestions: "Generisanje pitanja…",
    yourScore: "Vaš rezultat",
    done: "Gotovo",
    questionOf: "Pitanje {{current}} od {{total}}",
    answeredCount: "Odgovoreno {{answered}} / {{total}}",
    submitQuiz: "Pošalji kviz",
    startAQuiz: "Započni kviz",
    practiceQuizzes: "Probni kvizovi",
    generateQuizzesDescription: "Generiši kvizove iz baze ispita ili pomoću AI.",
    aiGeneratedShort: "Generisano pomoću AI",
    fromFolderShort: "Iz fascikle",
  },
  profile: {
    officialResults: "Zvanični rezultati",
    officialResultsDescription: "Ocene koje su uneli vaši profesori i asistenti.",
    quizPracticeHistory: "Istorija probnih kvizova",
    practiceOnly: "Samo za vežbu",
    doesntAffectGrade: "Ne utiče na vašu ocenu.",
    subject: "Predmet",
    type: "Tip",
    source: "Izvor",
    score: "Rezultat",
    date: "Datum",
    espb: "ESPB",
    scoreLabel: "Rezultat",
    yearLabel: "Godina",
  },
  admin: {
    panel: "Administratorski panel",
    subjects: "Predmeti",
    enrolled: "{{count}} upisano",
    createStaffAccount: "Kreiraj nalog za osoblje",
    people: "Ljudi",
    name: "Ime",
    email: "E-mail",
    role: "Uloga",
    subjectsColumn: "Predmeti",
    firstNamePlaceholder: "Ime",
    lastNamePlaceholder: "Prezime",
    emailPlaceholder: "E-mail",
    enrollInSubject: "Upiši na predmet…",
    noYearOrEarlierSubjects: "Nema preostalih predmeta {{year}}. godine ili ranije",
    nothingLeftToAssign: "Nema ništa preostalo za dodelu",
  },
  subject: {
    upcomingExams: "Predstojeći ispiti",
    noUpcomingExams: "Nema predstojećih ispita za ovaj predmet.",
    materials: "Materijali",
    quizzes: "Kvizovi",
    assignments: "Zadaci",
    project: "Projekat",
    students: "Studenti",
    startAProject: "Pokreni projekat",
    lectures: "Predavanja",
    exercises: "Vežbe",
    midtermExams: "Kolokvijumi",
    finalExam: "Ispit",
    notFound: "Predmet nije pronađen.",
    changeSubjectPicture: "Promeni sliku predmeta",
  },
  materials: {
    addLecture: "Dodaj predavanje",
    addExercise: "Dodaj vežbu",
    newLecture: "Novo predavanje",
    newExercise: "Nova vežba",
    title: "Naslov",
    choosePdfSlides: "Izaberi PDF/slajdove",
    noLecturesYet: "Još uvek nema predavanja",
    noExercisesYet: "Još uvek nema vežbi",
    lectureFilesDescription: "Fajlovi predavanja će se pojaviti ovde nakon otpremanja.",
    exerciseFilesDescription: "Fajlovi vežbi će se pojaviti ovde nakon otpremanja.",
    name: "Naziv",
    modified: "Izmenjeno",
    modifiedBy: "Izmenio",
    nothingHereYet: "Ovde još uvek ništa nema.",
  },
  exam: {
    addPracticePool: "Dodaj bazu probnih pitanja",
    addMidterm: "Dodaj kolokvijum",
    addFinal: "Dodaj ispit",
    newMidterm: "Novi kolokvijum",
    newFinal: "Novi ispit",
    namePlaceholder: "Naziv (npr. {{example}})",
    noMidtermMaterials: "Još uvek nema materijala za kolokvijum",
    noFinalMaterials: "Još uvek nema materijala za ispit",
    practiceQuestionPool: "Baza probnih pitanja",
    noPracticePool: "Još uvek nije otpremljena baza probnih pitanja",
    enterPoints: "Unesi bodove",
    enterPointsMidtermDescription: "Unosi asistent ili profesor.",
    enterPointsFinalDescription: "Unosi profesor — ovo određuje konačnu ocenu predmeta.",
    enterScores: "Unesi rezultate",
    scorePlaceholder: "bodovi",
    maxPlaceholder: "maks.",
  },
  assignment: {
    newAssignment: "Novi zadatak",
    titlePlaceholder: "Naslov",
    instructionsPlaceholder: "Uputstva",
    attachReferenceFile: "Priloži referentni fajl",
    multipleSubmissionsAllowed: "Dozvoljeno je više predaja",
    singleSubmission: "Jedna predaja",
    handedIn: "Predato",
    notHandedIn: "Nije predato",
    instructions: "Uputstva",
    referenceMaterials: "Referentni materijali",
    yourSubmission: "Vaša predaja",
    submittedOn: "Predato {{date}}",
    writeAnswer: "Napišite svoj odgovor (opciono)",
    attachFile: "Priloži fajl / sliku",
    handIn: "Predaj",
    handInAgain: "Predaj ponovo",
    submissions: "Predaje ({{count}})",
    noSubmissionsYet: "Još uvek nema predaja.",
    dueDate: "Rok {{date}} · ",
  },
  project: {
    members: "član",
    membersPlural: "članova",
    uploadProjectFile: "Otpremi fajl projekta",
    addTeammate: "Dodaj člana tima…",
    noFilesUploaded: "Još uvek nema otpremljenih fajlova.",
  },
  students: {
    student: "Student",
    total: "Ukupno",
  },
  gradeTable: {
    exam: "Ispit",
    points: "Bodovi",
    max: "Maks.",
    noExamsRecorded: "Nema evidentiranih ispita.",
    total: "Ukupno",
    finalGrade: "Konačna ocena",
  },
  file: {
    uploadFile: "Otpremi fajl",
  },
  role: {
    guardHint: "",
  },
  fileTable: {
    name: "Naziv",
    modified: "Izmenjeno",
    modifiedBy: "Izmenio",
  },
  scoreChip: {
    noScore: "Nema rezultata",
  },
  notifications_ns: {
    newExam: "Novi ispit zakazan: {{exam}} — {{subject}}",
  },
};

const translations: Record<Language, TranslationDict> = { en, sr };

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const v = vars[key];
    return v === undefined ? match : String(v);
  });
}

function readInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "en" || stored === "sr" ? stored : "en";
}

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readInitialLanguage);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value = getByPath(translations[language], key) ?? getByPath(translations.en, key);
      if (typeof value !== "string") return key;
      return interpolate(value, vars);
    },
    [language],
  );

  const value = useMemo<I18nContextValue>(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within a LanguageProvider");
  return ctx;
}

export const useLanguage = useTranslation;
