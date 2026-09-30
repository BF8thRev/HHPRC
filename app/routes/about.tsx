import { FileIcon, MailIcon, MapPinIcon } from "../components/icons";
import { Card, PageHeader, Section, TextLink } from "../components/ui";
import { board, club, documents } from "../content/sample";
import { ALLOWED_TYPES, documentHref, listDocuments } from "../lib/documents";
import type { Route } from "./+types/about";

export function meta(_: Route.MetaArgs) {
  return [{ title: `About the club | ${club.shortName}` }];
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("");

// Board uploads win; until there are any, link the files on the old site.
export async function loader({ context }: Route.LoaderArgs) {
  const uploaded = await listDocuments(context.cloudflare.env.DB);
  return {
    documents:
      uploaded.length > 0
        ? uploaded.map((d) => ({
            title: d.title,
            href: documentHref(d),
            kind: ALLOWED_TYPES[d.contentType] ?? "File",
          }))
        : documents,
  };
}

export default function About({ loaderData }: Route.ComponentProps) {
  const { address } = club;
  return (
    <>
      <PageHeader
        title="About the club"
        intro="Run by neighbors, for neighbors."
        image="/images/evening.webp"
      />

      <Section title="Who we are">
        <p className="max-w-3xl text-lg">{club.about}</p>
      </Section>

      <Section title="Your volunteer board" eyebrow="Elected by members">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {board.map((person) => (
            <li key={person.name}>
              <Card className="flex h-full items-center gap-4 p-5">
                <span
                  aria-hidden
                  className="grid size-14 shrink-0 place-items-center rounded-full bg-pool/15 font-display text-xl font-extrabold text-deep"
                >
                  {initials(person.name)}
                </span>
                <span>
                  <span className="block font-display text-lg font-extrabold">{person.name}</span>
                  <span className="text-slate-700">{person.role}</span>
                </span>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Get involved">
        <ul className="grid gap-5 md:grid-cols-3">
          <li>
            <Card className="flex h-full flex-col border-t-4 border-coral">
              <h3 className="font-display text-xl font-extrabold">Host a party at the club</h3>
              <p className="mt-2 flex-1">
                Birthdays and get-togethers are welcome. Fill in the party forms and send them to
                the board with your date.
              </p>
              <p className="mt-4">
                <TextLink to="/about#documents">Get the party forms</TextLink>
              </p>
            </Card>
          </li>
          <li>
            <Card className="flex h-full flex-col border-t-4 border-grass">
              <h3 className="font-display text-xl font-extrabold">Volunteer</h3>
              <p className="mt-2 flex-1">
                Help at an event, lend a hand with club chores, or be the one who organizes
                something for our teens. We'd love that.
              </p>
              <p className="mt-4">
                <TextLink to={`mailto:${club.email}?subject=I'd%20like%20to%20volunteer`}>
                  Offer to help
                </TextLink>
              </p>
            </Card>
          </li>
          <li>
            <Card className="flex h-full flex-col border-t-4 border-pool">
              <h3 className="font-display text-xl font-extrabold">New to the neighborhood?</h3>
              <p className="mt-2 flex-1">
                Your home comes with a membership. Send the board your name, address and email so we
                can get you set up.
              </p>
              <p className="mt-4">
                <TextLink to={`mailto:${club.email}?subject=New%20homeowner`}>
                  Say hello to the board
                </TextLink>
              </p>
            </Card>
          </li>
        </ul>
      </Section>

      <Section title="Member documents" id="documents">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {loaderData.documents.map((doc) => (
            <li key={doc.href}>
              <a
                href={doc.href}
                className="flex min-h-11 items-center gap-3 rounded-2xl bg-white p-4 font-semibold shadow-soft ring-1 ring-deep/5 hover:ring-pool"
              >
                <FileIcon className="size-6 shrink-0 text-coral-text" />
                <span className="flex-1">{doc.title}</span>
                <span className="text-slate-700">{doc.kind}</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Contact us">
        <Card className="grid gap-6 sm:grid-cols-2">
          <div className="flex gap-3">
            <MapPinIcon className="size-6 shrink-0 text-pool-text" />
            <address className="not-italic">
              <strong className="block">Club mailbox</strong>
              {address.street}
              <br />
              {address.city}, {address.state} {address.zip}
            </address>
          </div>
          <div className="flex gap-3">
            <MailIcon className="size-6 shrink-0 text-pool-text" />
            <div>
              <strong className="block">Email</strong>
              <a className="underline underline-offset-4" href={`mailto:${club.email}`}>
                {club.email}
              </a>
              <br />
              <a className="underline underline-offset-4" href={`mailto:${club.boardEmail}`}>
                {club.boardEmail}
              </a>
            </div>
          </div>
        </Card>
      </Section>
    </>
  );
}
