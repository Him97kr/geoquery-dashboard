// src/apollo/queries.js
import { gql } from "@apollo/client";

// ── Fragments ─────────────────────────────────────────────────────────────────
const COUNTRY_CORE = gql`
  fragment CountryCore on Country {
    name code flag region population density area
    languages currencies capital
  }
`;

const COVID_CORE = gql`
  fragment CovidCore on CovidStats {
    cases todayCases deaths todayDeaths
    recovered active critical
    casesPerMillion deathsPerMillion updatedAt
  }
`;

// ── Queries ───────────────────────────────────────────────────────────────────

export const GLOBAL_STATS = gql`
  query GlobalStats {
    globalStats {
      totalCountries
      totalPopulation
      totalCovidCases
      totalCovidDeaths
      totalActive
      mostPopulated  { name code flag population }
      leastPopulated { name code flag population }
      highestDensity { name code flag density }
      mostCovidCases { name code flag covid { cases deaths } }
    }
  }
`;

export const GET_COUNTRIES = gql`
  ${COUNTRY_CORE}
  query GetCountries($region: String, $minPop: Int, $maxPop: Int, $limit: Int) {
    countries(region: $region, minPop: $minPop, maxPop: $maxPop, limit: $limit) {
      ...CountryCore
    }
  }
`;

export const SEARCH_COUNTRIES = gql`
  ${COUNTRY_CORE}
  query SearchCountries($query: String!) {
    searchCountries(query: $query) {
      ...CountryCore
    }
  }
`;

export const GET_COUNTRY = gql`
  ${COUNTRY_CORE}
  ${COVID_CORE}
  query GetCountry($name: String, $code: String) {
    country(name: $name, code: $code) {
      ...CountryCore
      covid { ...CovidCore }
      outbreaks { title date urlName summary }
    }
  }
`;

export const TOP_BY_POPULATION = gql`
  query TopByPopulation($limit: Int) {
    topByPopulation(limit: $limit) {
      name code flag population density region
    }
  }
`;

export const TOP_BY_COVID = gql`
  query TopByCovid($limit: Int) {
    topByCovid(limit: $limit) {
      name code flag region
      covid { cases deaths active critical casesPerMillion }
    }
  }
`;

export const COUNTRIES_WITH_OUTBREAKS = gql`
  query CountriesWithOutbreaks {
    countriesWithOutbreaks {
      name code flag region population
      outbreaks { title date urlName }
    }
  }
`;
