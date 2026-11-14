# Project library backups

Library backups are local JSON files in the `barans-scoreboard-library` format, version `1`. They include saved scoreboards, leaderboards, tournament brackets, folders and project organisation. The import screen validates the complete file before changing local storage.

For older saved projects that did not record a creation time, the migration uses their first available last-modified time as the added date. The original saved data did not contain a separate creation date.

The first library load copies legacy scoreboards and Studio documents into the shared library store. It leaves both original stores untouched, so the migration does not delete old records.

Imports can merge with the current library or replace it. Merge keeps existing projects, imports ID conflicts as new copies and combines folders with the same name. Replace writes the validated backup in one IndexedDB transaction. Older `scoreboard` backup files (versions 1 and 2) can still be imported; they contain scoreboards only.

Scoreboard share keys are omitted from exported backups. Project data and folders remain in the browser; the application does not upload backups or synchronise them between devices.
