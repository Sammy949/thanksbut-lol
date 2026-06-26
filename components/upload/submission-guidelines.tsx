import { Shield, BadgeCheck, Globe, Heart } from "lucide-react";

/** The Guidelines tab — house rules, including the PII "scrub personal info" nudge. */
const GUIDELINES = [
  {
    icon: Shield,
    title: "Privacy First",
    body: "Scrub any personal info (names, emails, phones) from your screenshots. We love rejection, not doxxing.",
  },
  {
    icon: BadgeCheck,
    title: "Real Rejections Only",
    body: "Keep it authentic. The internet's hustle is more interesting than fiction.",
  },
  {
    icon: Globe,
    title: "All Industries Welcome",
    body: "Tech, art, academia, dating—if it's a 'no', it's art.",
  },
  {
    icon: Heart,
    title: "Keep it Classy",
    body: "We celebrate the hustle. No hate speech or harassment.",
  },
];

export function SubmissionGuidelines() {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-headline-md text-on-surface font-display text-center">
        Submission Guidelines
      </h3>
      <ul className="flex flex-col gap-5">
        {GUIDELINES.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-3">
            <Icon className="text-on-surface mt-0.5 size-5 shrink-0" />
            <div>
              <p className="text-body-md text-on-surface font-body font-semibold">
                {title}
              </p>
              <p className="text-body-md text-on-surface-variant font-body">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
