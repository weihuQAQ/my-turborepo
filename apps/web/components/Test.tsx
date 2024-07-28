"use client";

import React, { PropsWithChildren } from "react";

import {
  RetrieveContentProvider,
  RetrieveContent,
  RootProvider,
} from "@repo/contentful/render";
import { LandingPageComponentMap } from "@components/component-map";

function Test(props: PropsWithChildren<{ res: any }>) {
  console.log(123456, props.res);
  const contents = props.res?.fields?.template?.fields?.content ?? [];

  return (
    <div>
      <RootProvider value={props.res}>
        <RetrieveContentProvider value={LandingPageComponentMap}>
          <RetrieveContent contents={contents} template="landing" />
        </RetrieveContentProvider>

        {props.children}
      </RootProvider>
    </div>
  );
}

export default Test;
