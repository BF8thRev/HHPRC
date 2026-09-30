# Editing the site (for the board)

No passwords. You sign in with your email address and a 6-digit code.

## Signing in

1. Go to **hhprc.club/admin** on your phone or computer.
2. Type your email address (for example `huntingtonhillssrc@gmail.com`) and tap **Send me the code**.
3. Open your email. Look for a message from Cloudflare Access with a 6-digit code. Check spam the first time.
4. Type the code. You're in. The browser remembers you for about a day.

Only addresses on the board list can get a code. Anyone else sees "Board members only."

## What you can change

Pick a card on the **Edit the site** page, change the words, tap **Save changes**. The site updates right away.

- **News and announcements**: the cards on the home page. Clear a title to remove one.
- **Events and lessons**: the Events page and the home page calendar. Times are club time.
- **Yearly members meeting**: date, place and whether the time is confirmed.
- **Club rules**: the highlights on the Rules page. One rule per line.
- **Documents**: upload or remove PDFs and forms on the About page.

You can't break the design. Colors, fonts and layout are fixed. If you make a mistake, tap **Undo all my changes here** at the bottom of that part to go back to the starter text.

Pool hours, season dates and dues are not editable here yet. Ask whoever maintains the site.

## Ideas, questions and issues (private)

Notes neighbors send through the site go to **Ideas, questions and issues** on the Edit page. Only the inbox owner (`FEEDBACK_OWNER_EMAIL`) can open it. Other board members can edit the site but get "This inbox is private."

Tap **Mark as done** when you've handled one. If the neighbor left an email, tap it to reply.

## For whoever runs the Cloudflare account: adding or removing a person

Nobody needs a password or a Cloudflare account. To give someone access:

1. Cloudflare dashboard → **Zero Trust** → **Access** → **Applications**.
2. Open **HHPRC board portal** (see `SETUP.md` to create it the first time).
3. **Policies** → edit the **Allow** policy → add the person's email under **Emails** → save.

To remove someone, delete their email from the same list. Their next sign-in fails, and existing sessions end within a day.

The application must cover these paths on the site: `board`, `admin` (and everything under them). Don't protect `files`; uploaded documents are public.
