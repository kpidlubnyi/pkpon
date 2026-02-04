# **PKP-ON** - Interaktywna mapa rozkładu jazdy PKP

### Autorzy:
- **Kostiantyn Pidlubnyi** - 50776 (Backend, DevOps)
- **Yelyzaveta Shevchenko** - 50780 (Frontend)
- **Hleb Shyn** - 58706 (UI/UX, Managment)

## Opis projektu

**PKP-ON** to kompleksowa aplikacja webowa do przeglądu rozkładu jazdy PKP. System łączy dane z całej sieci PKP w przystępny, interaktywny interfejs, umożliwiający wyszukiwanie połączeń, wizualizację tras na mapie oraz zarządzanie kontem użytkownika. _"Jeden ekran. Cała Polska kolejowa."_

## Technologie:
- **Backend**: Django, Django REST Framework, Celery
- **Frontend**: React, TypeScript, Vite
- **Baza danych**: PostgreSQL, Redis (cache)
- **Dodatkowe**: Redis (broker do Celery), OpenRailRouting (routing kolejowy)

## Funkcjonalności

### 1. Zarządzanie użytkownikami
- Rejestracja nowych użytkowników z walidacją danych
- Logowanie/wylogowanie z sesją

### 2. Wyszukiwanie połączeń
- Wyszukiwanie tras między przystankami
- Wyświetlanie szczegółowych informacji o podróży
- Obliczanie czasu przejazdu i przesiadek
- Wizualizacja wszystkich przystanków na trasie

### 3. Wizualizacja map
- Interaktywna mapa tras kolejowych
- Wyświetlanie przystanków na mapie
- Wizualizacja wybranej trasy
- Integracja z OpenRailRouting

### 4. Informacje o przystankach
- Przeglądanie wszystkich przystanków
- Szczegółowe informacje o rozkładzie każdego przystanku
- Lokalizacja przystanków na mapie

### 5. System kolejkowania zadań
- Codzienna aktualizacja rozkładu jazdy zgodnie z nowymi danymi podane poprzez format GTFS
- Aktualizacja grafu połączeń dróg kolejowych co 3 dni 
- Celery Beat do zadań okresowych
- Redis jako broker wiadomości

### W planach:
- Mapy izochroniczne dla przystaków, pokazujące dokąd dojedziemy za wybraną liczbę godzin.
- Zarządzanie listą wybranych przejazdów i połączeń.
- Wyświetlanie informacji o wagonach dołączanych do składów pociągów

## Kontenery Docker

1. **postgres-db** - Baza danych PostgreSQL
2. **redis** - Serwer Redis dla cache i kolejki
3. **backend** - Aplikacja Django (API)
4. **celery-worker** - Worker Celery do zadań asynchronicznych
5. **celery-beat** - Scheduler Celery do zadań okresowych
6. **orr** - OpenRailRouting dla routingu kolejowego
7. **frontend** - Aplikacja React (port 3000)


## Uruchomienie

1. Sklonuj i przejdź do repozytorium 
   ```bash
   git clone https://github.com/kpidlubnyi/pkpon
   
   cd pkpon
   ```
2. Pobierz repozytoria będące submodułami
   ```bash
   git submodule init
   git submodule upgrade
   ```
3. Uruchom projekt za pomocą Docker Compose
   ```bash
   docker compose up -d
   ```

4. Poczekaj, aż **wszystkie kontenery się uruchomią** (OpenRailRouting może potrzebować kilku minut)

5. Aplikacja dostępna pod adresem: **http://localhost:3000**

