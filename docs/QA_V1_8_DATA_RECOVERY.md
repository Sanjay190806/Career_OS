# QA: v1.8 Data Recovery Hotfix

Use this checklist to verify that old Today progress is detected, backed up, and restored without deleting old data.

1. Open the app in the browser.
2. Open browser DevTools.
3. Go to Application -> Local Storage.
4. Confirm whether old keys exist, especially `sanju-career-os-persist`, `sanju-career-os-v1`, or `sanju-placement-v3`.
5. Confirm the new v1.8 key is `sanzz-placement-discipline-v18`.
6. Run the app.
7. Open Settings / Backup.
8. Find the Progress Recovery panel.
9. Confirm detected localStorage keys are shown.
10. Confirm old data found yes/no.
11. Confirm new data found yes/no.
12. Confirm today date is shown as India local date in `YYYY-MM-DD`.
13. Click Backup Current Data.
14. Confirm a timestamped key starting with `sanzz-placement-discipline-v18-recovery-backup` exists in localStorage.
15. Click Recover Old Progress.
16. Confirm the message says previous progress was restored, or says no overwrite happened when v1.8 data already exists.
17. Confirm today’s work appears in the Today tab.
18. Refresh the app.
19. Confirm today’s work still appears.
20. Confirm the heatmap and streak update from the restored entry.
21. Confirm no duplicate entries were created for the same date.
22. Confirm old keys still exist and were not deleted.
23. Use Export Raw Recovery Data only if automatic migration cannot map the data.

Notes:

- The recovery migration keeps old keys for at least one version.
- The migration writes metadata to `sanzz-placement-discipline-v18-recovery-metadata`.
- The migration never clears localStorage and never removes old progress keys.
- Dates are normalized to `YYYY-MM-DD` using `Asia/Kolkata`.

