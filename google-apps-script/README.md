# LEA Website Forms Backend

Use `website-forms.gs` in Google Apps Script.

## What It Creates

- One Google Spreadsheet named `LEA Organization Website Form Responses`.
- Four separate tabs:
  - `Volunteers`
  - `Donors`
  - `Contact`
  - `Partners`
- Each tab has its own columns.
- Every submission also sends an email notification to `leaorganizationke@gmail.com`.

## Setup

1. Go to `script.google.com`.
2. Create a new Apps Script project.
3. Replace the default code with `website-forms.gs`.
4. Click **Deploy > New deployment**.
5. Choose **Web app**.
6. Set **Execute as** to **Me**.
7. Set **Who has access** to **Anyone**.
8. Deploy and copy the Web App URL.
9. Replace `scriptAction` in `src/data.ts` with that Web App URL.

Do not put any email password in the site or Apps Script.
