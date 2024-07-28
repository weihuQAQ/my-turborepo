import React, { useContext } from "react";

export const context = React.createContext<Record<string, unknown>>({});
export const RetrieveContentProvider = context.Provider;

export const RootContext = React.createContext<Record<string, unknown>>({});
export const RootProvider = RootContext.Provider;

/**
 * props
 * @param widget contentful widget
 * @param template key of component map
 * @param thirdPartyData third party data out of contentful, just like optimizely feature
 */
interface RenderComponentProps {
  widget: any;
  template: string;
  thirdPartyData?: Record<string, unknown>;
  componentMap: Record<string, unknown>;
}

export const RenderComponent = React.memo<RenderComponentProps>((props) => {
  const { widget, template, thirdPartyData = {}, componentMap } = props;

  const Component = componentMap[
    widget?.fields?.componentType
  ] as React.ComponentType;

  if (!Component) {
    console.warn(`Widget [${widget?.fields?.componentType}] cannot find.`);
    return null;
  }

  return <Component {...widget} {...thirdPartyData} template={template} />;
});

RenderComponent.displayName = "RenderComponent";

export const retrieveGroup = (groups, contentKey) => {
  let components = [];
  groups?.forEach((group) => {
    if (contentKey === group?.fields?.targetContentKey) {
      components = group?.fields?.content;
    }
  });
  return components;
};

interface RetrieveContentProps {
  contents: any[];
  template: string;
}

export const RetrieveContent = React.memo<RetrieveContentProps>((props) => {
  const { contents, template } = props;
  const componentMap = useContext(context);
  const components = contents.map((content, index) => {
    return (
      <RenderComponent
        key={`${content.name}-${content.contentful_id}-${index}`}
        widget={content}
        template={template}
        componentMap={componentMap}
      />
    );
  });
  return <>{components}</>;
});

RetrieveContent.displayName = "RetrieveContent";

export const AssetContent = (props: { fields: any }) => {
  const { fields: { contentKey} } = props;
  const res = useContext(RootContext);
  const { assetContentGroups = [] } = res?.fields as any ?? {};
  const template = "";
  const renderContentGroups = assetContentGroups.filter(
    (item) => item.fields?.enable !== false,
  );
  const components = retrieveGroup(renderContentGroups, contentKey);
  return <RetrieveContent contents={components} template={template} />;
};

AssetContent.displayName = "AssetContent";

export const ContentGroupContainer = (props) => {
  console.log(123, props)
  const template = ''
  return (
      <div
          className={'content-group-container'}
      >
        <fieldset>
          <legend>ContentGroupContainer</legend>

          <div>
            <RetrieveContent contents={props.fields?.content ?? []} template={template} />
          </div>
        </fieldset>

      </div>
  );
};
ContentGroupContainer.displayName = 'ContentGroupContainer';
