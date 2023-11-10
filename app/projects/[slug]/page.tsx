import { Breadcrumbs } from "components/Breadcrumbs";
import { MarkdownContent } from "components/MarkdownContent";
import Image from "next/image";
import { notFound } from "next/navigation";
import React, { ReactNode } from "react";
import Icons from "components/icons";
import { Project, getAllProjects } from "src/data/project";
import { clsx } from "clsx";
import {
  TeamEngagement,
  getTeamEngagementsForProject,
} from "src/data/team-engagement";
import { Route } from "src/routing";
import Link from "next/link";
import { Sidebar } from "components/Sidebar";
import { ProjectCard } from "components/ProjectCard";
import { shuffleInPlace } from "src/utils";
import { Opportunity, getOpportunitiesForProject } from "src/data/opportunity";
import { OpportunityRow } from "components/OpportunityRow";
import {
  Event,
  compareEventsByTime,
  findEventsForProject,
  isEventPast,
} from "src/data/event";
import { EventCard } from "components/EventCard";

type Params = {
  slug: string;
};

export type Props = {
  params: Params;
};

/** Project detail page */
async function Page({ params }: Props) {
  const allProjects = await getAllProjects();
  const project = allProjects.find((p) => p.slug === params.slug);
  if (!project) {
    notFound();
  }

  const otherProjects = shuffleInPlace(
    allProjects
      .filter((p) => p.slug !== params.slug)
      .filter((p) => p.state === "running" || p.state === "incubating")
  ).slice(0, 3);

  const opportunities = (await getOpportunitiesForProject(project.slug)).filter(
    (o) => o.status === "live"
  );

  const events = (await findEventsForProject(project.slug))
    .filter((e) => e.published)
    .sort(compareEventsByTime)
    .reverse()
    .slice(0, 3)
    .reverse();

  const allTeamEngagements = await getTeamEngagementsForProject(project.slug);
  const coordinators = allTeamEngagements
    // Only take coordinators
    .filter((e) => e.coordinatingRole)
    // Sort inactive engagements last
    .sort((a, b) => {
      if (a.inactive && !b.inactive) {
        return +1;
      } else if (b.inactive && !a.inactive) {
        return -1;
      } else {
        return 0;
      }
    });

  return (
    <main className="py-20 px-7 max-w-content m-auto">
      <Breadcrumbs
        path={[
          { label: "Homepage", path: "/" },
          { label: "Projekty", path: Route.projects },
        ]}
        currentPage={project.name}
      />

      <h1 className="typo-title mt-7 mb-2">{project.name}</h1>
      <h2 className="typo-subtitle mb-10 max-w-prose">
        {stripTrailingComma(project.tagline)}
      </h2>
      <div className="aspect-[2.3] relative mb-10">
        <Image
          src={project.coverImageUrl}
          className="object-cover bg-gray"
          alt=""
          fill
        />
      </div>

      <div className="flex flex-col gap-20">
        {/* Main project info */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
          <section className="lg:col-span-2">
            <h2 className="typo-title2">O projektu</h2>
            <MarkdownContent source={project.description.source} />
          </section>
          <aside>
            <ProjectSidebar project={project} coordinators={coordinators} />
          </aside>
        </div>

        {/* TBD: Videos, blog posts */}

        {events.length > 0 && <EventsBox events={events} />}

        {opportunities.length > 0 && (
          <OpportunitiesBox opportunities={opportunities} />
        )}

        <OtherProjectsBox projects={otherProjects} />
      </div>
    </main>
  );
}

//
// Sidebar
//

const ProjectSidebar = ({
  project,
  coordinators,
}: {
  project: Project;
  coordinators: TeamEngagement[];
}) => {
  // If we have some active coordinators, display just those; otherwise display all
  const activeCoordinators = coordinators.filter((c) => !c.inactive);
  const displayedCoordinators =
    activeCoordinators.length > 0 ? activeCoordinators : coordinators;

  const links = project.links || [];
  const featuredLink = links.find((link) => link.featured);
  const ordinaryLinks = links.filter((link) => link !== featuredLink);

  const CoordinatorList = () => (
    <div>
      {displayedCoordinators.map((c) => (
        <div
          key={c.id}
          className={clsx(
            "flex flex-row gap-4 items-center mb-2",
            c.inactive && "opacity-50"
          )}
        >
          {/* TBD: Fix non-square avatars, https://app.cesko.digital/projects/digitalni-inkluze */}
          <Image
            src={c.userAvatarUrl}
            className="rounded-full"
            width={60}
            height={60}
            alt=""
          />
          <span>{c.userName}</span>
        </div>
      ))}
    </div>
  );

  const LinkList = () => (
    <ul className="flex flex-col gap-4">
      {ordinaryLinks.map((link) => (
        <li key={link.url} className="flex flex-row item-center gap-2">
          <LinkIcon url={link.url} />
          <Link href={link.url} className="underline">
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  );

  const FeaturedLinkButton = () => (
    <div>
      <a className="block btn-primary text-center" href={featuredLink?.url}>
        {featuredLink?.name}
      </a>
    </div>
  );

  return (
    <Sidebar
      primaryCTA={featuredLink ? <FeaturedLinkButton /> : undefined}
      sections={[
        {
          label: "Koordinace projektu",
          content: <CoordinatorList />,
          onlyIf: coordinators.length > 0,
        },
        {
          label: "Odkazy",
          content: <LinkList />,
          onlyIf: ordinaryLinks.length > 0,
        },
      ]}
    />
  );
};

const LinkIcon = ({ url }: { url: string }) => {
  const ICONS_BY_PAGES = {
    "cesko-digital.slack.com": Icons.Slack,
    "app.slack.com": Icons.Slack,
    "github.com": Icons.GitHub,
    "cesko-digital.atlassian.net/jira": Icons.Jira,
    "trello.com": Icons.Trello,
    "cesko-digital.atlassian.net": Icons.Confluence,
    "miro.com": Icons.Miro,
    "youtube.com": Icons.YouTube,
    "app.asana.com": Icons.Asana,
    "calendar.google.com": Icons.GoogleCalendar,
    "docs.google.com": Icons.GoogleDocs,
    "drive.google.com": Icons.GoogleDrive,
    "figma.com": Icons.Figma,
    "airtable.com": Icons.Airtable,
  };

  const hostname = getHostname(url);
  for (const [page, Icon] of Object.entries(ICONS_BY_PAGES)) {
    if (hostname.startsWith(page)) {
      return <Icon />;
    }
  }

  return <Icons.GenericWebsite />;
};

//
// Related info boxes
//

const RelatedContentBox = ({
  label,
  content,
  seeAllUrl,
  seeAllLabel,
}: {
  label: string;
  content: ReactNode;
  seeAllUrl?: string;
  seeAllLabel?: string;
}) => (
  <section>
    <div className="flex md:flex-row gap-7 items-center">
      <h2 className="typo-title2 mb-4">{label}</h2>
      {seeAllUrl && (
        <Link href={seeAllUrl} className="typo-link ml-auto mr-1">
          {seeAllLabel}
        </Link>
      )}
    </div>
    {content}
  </section>
);

const OtherProjectsBox = ({ projects }: { projects: Project[] }) => (
  <RelatedContentBox
    label="Další projekty"
    seeAllLabel="Všechny projekty"
    seeAllUrl={Route.projects}
    content=<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  />
);

const OpportunitiesBox = ({
  opportunities,
}: {
  opportunities: Opportunity[];
}) => (
  <RelatedContentBox
    label="Právě hledáme"
    seeAllLabel="Všechny hledané role"
    seeAllUrl={Route.opportunities}
    content=<div>
      {opportunities.map((o) => (
        <OpportunityRow key={o.id} role={o} />
      ))}
    </div>
  />
);

const EventsBox = ({ events }: { events: Event[] }) => (
  <RelatedContentBox
    label="Vybrané akce"
    seeAllLabel="Všechny akce"
    seeAllUrl={Route.events}
    content=<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
      {events.map((e) => (
        <EventCard key={e.id} event={e} fade={isEventPast(e)} />
      ))}
    </div>
  />
);

//
// Helpers
//

/**
 * Returns a hostname of the provided URL without the "www." prefix.
 */
const getHostname = (url: string): string => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
};

const stripTrailingComma = (s: string) => s.replace(/\.?\s*$/, "");

export default Page;