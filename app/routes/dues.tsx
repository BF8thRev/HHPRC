import { Card, PageHeader, Section, TextLink } from "../components/ui";
import { club, season } from "../content/sample";
import { formatDay } from "../lib/dates";
import { formatCents } from "../lib/money";
import type { Route } from "./+types/dues";

export function meta(_: Route.MetaArgs) {
  return [{ title: `Club dues | ${club.shortName}` }];
}

export function loader() {
  return {
    amount: formatCents(season.duesCents),
    lateFee: formatCents(season.lateFeeCents),
    dueOn: formatDay(season.duesDueOn),
  };
}

export default function Dues({ loaderData }: Route.ComponentProps) {
  const { amount, lateFee, dueOn } = loaderData;
  const { address } = club;
  return (
    <>
      <PageHeader
        title="Club dues"
        intro={`${season.name} dues are ${amount} per household, due ${dueOn}.`}
      />

      <Section title="The details">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-slate-700">Dues</p>
            <p className="font-display text-3xl font-extrabold">{amount}</p>
          </Card>
          <Card>
            <p className="text-slate-700">Due</p>
            <p className="font-display text-2xl font-extrabold">{dueOn}</p>
          </Card>
          <Card>
            <p className="text-slate-700">Late fee after the due date</p>
            <p className="font-display text-3xl font-extrabold">{lateFee}</p>
          </Card>
        </div>
        <p className="mt-4">
          All new and existing members pay dues. Statements are mailed in {season.statementsMailed}.
        </p>
      </Section>

      <Section title="Ways to pay">
        <ul className="grid gap-4 sm:grid-cols-2">
          <li>
            <Card className="h-full">
              <h3 className="font-display text-lg font-extrabold">Online</h3>
              <p className="mt-2">
                Soon you'll pay by bank transfer or card from your household login, and see your
                receipt right away.
              </p>
            </Card>
          </li>
          <li>
            <Card className="h-full">
              <h3 className="font-display text-lg font-extrabold">By check</h3>
              <p className="mt-2">
                Make it payable to {club.name}. Mail it to {address.street}, {address.city},{" "}
                {address.state} {address.zip}, or drop it in the locked club mailbox there.
              </p>
            </Card>
          </li>
        </ul>
        <p className="mt-4">
          <TextLink to={`mailto:${club.email}?subject=Dues`}>Questions? Email the board</TextLink>
        </p>
      </Section>
    </>
  );
}
