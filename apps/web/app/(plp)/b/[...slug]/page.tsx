import React from "react";
import { getContentfulEntries } from "@repo/contentful";
import Test from "@components/Test";

async function Page(props: { params: { slug: string[] } }) {
  const { tree } = await getContentfulEntries(
    `/b/${props.params.slug.join("/")}`,
  );

  return (
    <div>
      <span>standard plp</span>
      <Test res={tree}>
        {`/b/${props.params.slug.join("/")}`}
      </Test>
    </div>
  );
}

export default Page;
