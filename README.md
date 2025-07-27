# Strona internetowa OMatKo!!!

## TODO

- [ ] Import aktualności ze starej strony (?)
- [x] Podstrona ze sztabem
- [ ] Poprzednie edycje (?)
- [ ] Dokumentacja
- [ ] Layout dla tabletów i dużych ekranów
- [ ] Abstrakty w harmonogramie
- [ ] Integracja z omatko-glosuj
- [ ] Github Actions

> [!WARNING]
>
> Strona jest generowana przy pomocy [HUGO](https://gohugo.io/).
>
> Instalacja na Windowsie (w powershell'u):
>
> `winget install Hugo.Hugo.Extended`

## Generowanie

Wygeneruj stronę przy pomocy komendy:`hugo`

Folder _public_ zwiera wygenerowaną stronę.

## Development

Komenda `hugo server --buildDrafts --noHTTPCache` uruchamia serwer http.

Podgląd strony na żywo będzie dostępny na [localhost:1313](http://localhost:1313).

Hugo używa motywów do tworzenia stron.
Dla jednej edycji konferencji powinien istnieć jeden motyw.
Aby zmienić motyw ustaw parametr `theme='rok-edycji'`.

## Zarządzanie stroną

W pliku _hugo.toml_ znajduje się konfiguracja strony.
Znajdują się tam parametry odpowiadające za wyświetlanie konkretnych sekcji:

- harmonogramu
- zapisów
- sponsorów i patronów

### Sponsorzy i patroni

Aby dodać sponsorów, wystarczy wkleić loga do folderu _themes/\*/static/sponsors_. Sponsor główny ma własny folder _main_.
To samo z patronami.

### Harmonogram

Dane z harmonogramu znajdują się w folderze _themes/\*/data/schedule_.
Żeby dodać dzień, stwórz plik .yml z datą tego dnia w formacie **YYYY-MM-DD**.

Przykładowa zawartość pliku:

```yml
- time: "9:00" # Czas punktów programu konferencji
  events: # Lista punktów
    - name: "Nazwa wykładu"
      author: "Imię Nazwisko" # Opcjonalne
      location: "Miejsce wykładu" # Opcjonalne
      type: "stosowana" # Blok matematyki stosowanej
    - name: "Inny wykład"
      location: "Inne miejsce wykładu"
      author: "dr mgr inż rehabilitowany Imię Nazwisko"
      type: "teoretyczna" # Blok matematyki teoretycznej
- time: "10:00"
  events:
    - name: "Przerwa na kawę"
- time: "20:00"
  events:
    - name: "Integracja"
    - location: "SKS"
```

> [!CAUTION]
>
> Uwaga na wcięcie tekstu. Musi być takie same dla jednej listy atrybutów, tak jak w pythonie.
>
> ```yml
> ❌
> - time: "9:00"
> events:
>       - name: "Wykład"
>    author: "Jan Kowalski"
> ```

### Zapisy

Linki do zapisów wstaw do parametrów:

```toml
participant_url = 'link'
speaker_url = 'inny link'
poster_url = 'kolejny link'
```

### Sztab

W folderze _data/organizers_ znajdują się pliki _.yml_ z danymi sztabu.
Wystarczy je wypełnić i wstawić zdjęcia do folderu _themes/\*/content/organizatorzy/photos_.
Żeby aktywować podstronę odkomentuj:

```toml
[[menus.main]]
 name = 'Organizatorzy'
 pageRef = 'organizatorzy'
 url = '/organizatorzy'
 weight = 3
```

### Posty

Dodaj post za pomocą komendy: `hugo new aktualnosci/tytul-posta.md`. [Możesz też użyć innych fomatów](https://gohugo.io/content-management/formats/).
Plik pojawi się w folderze _content/aktualnosci_.

## Aktualizacja strony

Aby zakutalizować stronę po dokonaniu zmian, otaguj commit z nową wersją strony.
Po otagowaniu, wejdź na serwer wydziału przy użyciu studenckiego vpn'a i odpal skrypt _pull.sh_, który pobierze najnowszą otagowaną wersje strony.

## Tagowanie

Konwencja jest następująca:

v13.1.3 - _edycja omatko_ | _wersja strony_ | _wersja poprawki_

**Nigdy nie używaj** _git push --force_
