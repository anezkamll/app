import ProjectList from "./card-list";
import HighlightedProject from "./highlighted";
import { CzechiaMapBitmap } from "components/illustrations";
import { Layout, Section, SectionContent } from "components/layout";
import { ButtonLink } from "components/links";
import { JoinUs } from "components/sections";
import { Body, Heading1, Heading2 } from "components/typography";
import { PortalProject } from "lib/airtable/project";
import { Route } from "lib/routing";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

export type Props = {
  projects: PortalProject[];
};

export const Page = ({ projects }: Props) => {
  const highlightedProject = projects.find((p) => p.highlighted);
  const otherRunningProjects = projects.filter(
    (p) =>
      p != highlightedProject &&
      (p.state === "running" || p.state === "incubating")
  );
  const finishedProjects = projects.filter((p) => p.state === "finished");
  return (
    <Layout
      crumbs={[{ label: "Co děláme" }]}
      head={{
        title: "Co děláme",
        description:
          "Díky expertnímu dobrovolnictví dokážeme dosáhnout velkých věcí a měnit život v Česku k lepšímu. Podívejte se, jak to děláme.",
      }}
    >
      <Section>
        <SectionContent>
          <Wrapper>
            <Heading>Co děláme</Heading>
          </Wrapper>
        </SectionContent>
      </Section>

      <Section>
        <SectionContent>
          <div className="grid grid-cols-3 gap-7">
            <div className="flex flex-col gap-7 col-span-2">
              <Heading2>Systémová změna</Heading2>
              <Body className="max-w-prose">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </Body>
              <div>
                <ButtonLink to={Route.caseForSupport}>
                  Chci vědět víc
                </ButtonLink>
              </div>
            </div>
            <SystemicChangeSquareTile />
          </div>
        </SectionContent>
      </Section>

      <Section>
        <SectionContent>
          <ProjectsHeading>Projekty</ProjectsHeading>
          <Body className="max-w-prose">
            Díky expertnímu dobrovolnictví dokážeme dosáhnout velkých věcí a
            měnit život v Česku k lepšímu. Prohlédněte si naše projekty a pokud
            vás zaujmou, podívejte se na{" "}
            <Link href={Route.opportunities}>
              aktuální příležitosti k zapojení
            </Link>
            .
          </Body>
        </SectionContent>
      </Section>

      <Section>
        <SectionContent>
          <ProjectsHeading>Aktuální projekty</ProjectsHeading>
          {highlightedProject && (
            <HighlightedProject project={highlightedProject} />
          )}
          <ProjectList projects={otherRunningProjects} />
        </SectionContent>
      </Section>

      <Section>
        <SectionContent>
          <ProjectsHeading>Dokončené projekty</ProjectsHeading>
          <ProjectList projects={finishedProjects} />
        </SectionContent>
      </Section>

      <Section>
        <SectionContent>
          <JoinUs />
        </SectionContent>
      </Section>
    </Layout>
  );
};

//
// Components
//

const SystemicChangeSquareTile = () => (
  <a
    className="aspect-square bg-white hover:bg-yellow border-lightGray border-[1px] relative flex flex-col overflow-clip p-10 no-underline text-black"
    href="https://drive.google.com/file/d/1-RLMuLgPK7UAhPwdZiBgcnCtnZ8Jy7oT/view?usp=share_link"
  >
    <Image
      src={CzechiaMapBitmap}
      className="absolute top-19 -right-[200px] opacity-60"
      alt=""
    />
    <h2 className="text-it leading-normal mt-0">
      Mapa
      <br />
      systémové
      <br />
      změny
    </h2>
    <p className="mt-auto mb-0 leading-relaxed">
      Klíčové aktivity a milníky jsme zanesli do mapy. Prohlédněte si ji v PDF →
    </p>
  </a>
);

//
// Styles
//

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 700px;
  overflow-wrap: break-word;
`;

const Heading = styled(Heading1)`
  margin: 50px 0 10px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-top: 38px;
  }
`;

const ProjectsHeading = styled(Heading2)`
  margin-bottom: 30px;
  margin-top: 30px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-bottom: 17px;
  }
`;
