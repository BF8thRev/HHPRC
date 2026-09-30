# Sending news sign-ups to the club's Gmail

Every address that signs up on the site is saved in our database first. The site also passes it to a small Google script that adds it to a Google Sheet (and, if you want, to Gmail Contacts) in the club's Google account. If Google is down, nothing is lost: an hourly job sends the ones that are missing.

You do this once, signed in to **huntingtonhillssrc@gmail.com**.

## 1. Make the Sheet

1. Go to sheets.google.com and create a blank sheet named **HHPRC news sign-ups**.
2. In row 1, type `Email` in A1 and `Signed up` in B1.

## 2. Add the script

1. In the Sheet: **Extensions → Apps Script**.
2. Delete what's there and paste this:

```js
const SHEET_NAME = "Sheet1";

function doPost(e) {
  const secret = PropertiesService.getScriptProperties().getProperty("SECRET");
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: "bad request" });
  }
  if (!secret || data.secret !== secret) return reply({ ok: false, error: "no" });

  const email = String(data.email || "")
    .trim()
    .toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply({ ok: false, error: "email" });

  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const existing = sheet.getRange("A:A").getValues().flat();
  if (!existing.includes(email)) {
    sheet.appendRow([email, data.signedUpAt || new Date().toISOString()]);
    addContact(email); // remove this line if you only want the Sheet
  }
  return reply({ ok: true });
}

// Adds the address to Google Contacts. Needs the "People API" service (step 3).
function addContact(email) {
  try {
    People.People.createContact({ emailAddresses: [{ value: email }] });
  } catch (err) {
    console.error("Contact not added: " + err);
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
```

3. Left sidebar → **Services (+)** → **Google People API** → **Add**. (Skip this if you only want the Sheet, and remove the `addContact(email)` line.)
4. **Project Settings (gear) → Script properties → Add script property**: name `SECRET`, value a long random phrase (make one up, 30+ characters). Keep a copy; you'll need it in step 4.

## 3. Publish it

1. **Deploy → New deployment → Web app**.
2. **Execute as:** Me. **Who has access:** Anyone. (The secret in step 2 is what keeps strangers out.)
3. **Deploy**, approve the permission prompts, and copy the **Web app URL** (ends in `/exec`).

## 4. Tell the site

Run these in the project folder. Each asks you to paste the value:

```bash
pnpm wrangler secret put SIGNUP_WEBHOOK_URL
pnpm wrangler secret put SIGNUP_WEBHOOK_SECRET
```

The first is the Web app URL, the second is the `SECRET` phrase. Then sign up with a test address on the site and watch it appear in the Sheet within seconds.

## Good to know

- Sign-ups made before this was set up are sent automatically within the hour.
- Contacts appear in Gmail under **Other contacts** or **Contacts**. To email everyone, use the Sheet's column A, or tag them with a label in Contacts.
- Before you email the list, include an unsubscribe line. A few emails a year from the board to people who asked for them is what the sign-up form promises.
- If you change the script later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.
