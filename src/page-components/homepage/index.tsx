import { Layout, Section, SectionContent } from 'components/layout'
import { Projects, JoinUs } from 'components/sections'
import { Hero, OurValues, Numbers, ImageGallery, Partners } from './sections'
import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { HomepageQuery } from 'generated/graphql-types'
import { I18nextContext } from 'gatsby-plugin-react-i18next'

interface IndexPageProps {
  data: HomepageQuery
}

const IndexPage: React.FC<IndexPageProps> = ({ data }: IndexPageProps) => {
  const { language } = useContext(I18nextContext)

  const theme = useContext(ThemeContext)
  const projects = data.projects.nodes
  const partners = data.partners.nodes

  const isCzech = language === 'cs'

  return (
    <Layout>
      <Section>
        <Hero />
      </Section>

      <Numbers />

      {isCzech && (
        <Section>
          <SectionContent>
            <Projects projects={projects} />
          </SectionContent>
        </Section>
      )}

      {isCzech && (
        <Section>
          <SectionContent>
            <JoinUs />
          </SectionContent>
        </Section>
      )}

      <Section backgroundColor={theme.colors.pebble}>
        <SectionContent>
          <OurValues />
        </SectionContent>
      </Section>

      <Section>
        <ImageGallery />
      </Section>

      {partners && partners.length > 0 && (
        <Section>
          <SectionContent>
            <Partners partners={partners} />
          </SectionContent>
        </Section>
      )}
    </Layout>
  )
}

export default IndexPage
