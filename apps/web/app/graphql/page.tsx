"use client";

import React from "react";
import { createGraphiQLFetcher } from "@graphiql/toolkit";
import { GraphiQL } from "graphiql";

import "graphiql/graphiql.css";

const space = "fictunykp8pa";
const environment = "dev5";
const access_token = "pLcrr3eNMOD0fRFjSd1q07dg0FATpQMagIA4O1Q_PpA";
const url = `https://graphql.contentful.com/content/v1/spaces/${space}/environments/${environment}?access_token=${access_token}`;

const fetcher = createGraphiQLFetcher({
  url: url//"https://swapi-graphql.netlify.app/.netlify/functions/index",
});

function Page() {
  return (
    <div>
      <div className="GraphiQL-container">
        <GraphiQL fetcher={fetcher} />
      </div>
    </div>
  );
}

export default Page;
