# MediCycle

AI Smart Medicine Waste Management System. Check the date before you take it. Scan a medicine pack, read the expiry date in the browser, track opened medicines, and see what to throw away. Frontend only (HTML, CSS, JavaScript). No server, no account, no API keys.

## Run it on your computer
Browsers block some features on file:// links, so use a small local server:

    cd expirylens
    python3 -m http.server 8000

Then open http://localhost:8000

## Host it free on GitHub Pages
1. Create a new public repository on GitHub.
2. Upload every file in this folder (keep the folders vendor, fonts and samples).
3. Settings > Pages > Deploy from a branch > main > / (root) > Save.
4. After about a minute your site is live at https://YOUR-NAME.github.io/REPO-NAME/
Cloudflare Pages and Netlify also work: drag the folder in. Check each host's current free limits.

## What is inside
- index.html, styles.css, app.js: the app
- parse.js: reads the expiry date from OCR text. It needs the EXP keyword and never guesses.
- kb.js: the small sourced guide behind the Ask tab. It has no AI model, so it cannot invent answers, and it refuses dosing and medical questions.
- vendor/: Tesseract.js v5 (OCR) with English data, running on the device
- fonts/: IBM Plex Sans and Noto Sans Telugu
- samples/: demo packs (illustrations made for this app, generic medicine names, no brand logos)

## Privacy
Photos are read on the device and never uploaded. The cabinet is saved in this browser only (localStorage).

## Honest limits
- Demo samples are illustrations made for this app, not real photos. Accuracy on real packs has not been measured. Test with 30 to 50 of your own photos before quoting a number.
- OCR can misread curved bottles, glare and dim light. The app shows its confidence and lets the user fix the date.
- No push notifications (no backend). Reminders are calendar (.ics) files and in-app status.
- Opened-medicine days: eye drops 28 days (Alberta Health Services default); liquids 28 days is a common default, so users should follow the label. Have a pharmacist review these rules.
- The Ask guide is paraphrased from FDA, NHS (ULH) and Alberta Health Services pages. Rules in India may differ. Have a pharmacist review it.
- The whole interface and the Ask guide can be shown in Telugu. I wrote the Telugu myself, so a native speaker must review it, especially the medical wording. Ask matches English keywords only. Typed medicine names stay as typed.
- If you open index.html by double-clicking, the OCR cannot start. Use a local server or hosting.
- Not a medical device. It does not replace a pharmacist or doctor.

## Sources
- FDA: https://www.fda.gov/drugs/safe-disposal-medicines/dont-be-tempted-use-expired-medicines
- FDA: https://www.fda.gov/drugs/safe-disposal-medicines/disposal-unused-medicines-what-you-should-know
- NHS (ULH): https://www.ulh.nhs.uk/patients/patient-information-library/storing-medicines-at-home/
- Alberta Health Services: https://www.albertahealthservices.ca/assets/info/hp/ltc/if-hp-ltc-e-12-storage-dating-full-tool.pdf

## Alerts
A website cannot push alerts while it is closed without a server. MediCycle shows an alert banner, sends a browser notification (at most once a day) when the app is opened, and exports calendar reminders (.ics) that alert even when the app is closed.

## Ask tab
The Ask tab answers about the medicines saved in the cabinet (what expires soon, what to use first, how much was wasted, whether a named medicine is in date). These answers are computed from the saved data, not generated. Storage and disposal questions use the sourced guide. Dosing and medical questions are refused.
