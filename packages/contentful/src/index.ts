import _ from "lodash";

import { buildContentfulPageTree } from "./helper";

const environment = "dev2";
const host = "https://cdn.contentful.com";
const space = "fictunykp8pa";
const accessToken = "EI45a7Aq77YvFDdUt8lLX8M_3aoJxB4B5dML7-V27dc";

const urls = {
  syncInitial: () => {
    return `${host}/spaces/${space}/environments/${environment}/sync?access_token=${accessToken}&initial=true`;
  },

  locales: () =>
    `${host}/spaces/${space}/environments/${environment}/locales?access_token=${accessToken}`,

  contentModel: () =>
    `${host}/spaces/${space}/environments/${environment}/content_types?access_token=${accessToken}&order=-sys.createdAt`,
  contentType: (content_type: string) =>
    `${host}/spaces/${space}/environments/${environment}/content_types/${content_type}?access_token=${accessToken}`,
  pageAssetEntries: () =>
    `${host}/spaces/${space}/environments/${environment}/entries?access_token=${accessToken}&content_type=pageAsset`,
  page: (URI: string, locale = "en-US", pageType = "Browsing Page") =>
    `${host}/spaces/${space}/environments/${environment}/entries?access_token=${accessToken}&content_type=pageAsset&fields.URI=${URI}&locale=${locale}&fields.pageType=${pageType}`,

  entry: (entryID: string) =>
    `${host}/spaces/${space}/environments/${environment}/entries/${entryID}?access_token=${accessToken}`,
  entries: (ids: string[], locale = "en-US") => {
    return `${host}/spaces/${space}/environments/${environment}/entries?access_token=${accessToken}&locale=${locale}&sys.id[in]=${ids.join(",")}`;
  },

  pageContent: ({
    template,
    assets,
    productGroups,
  }: {
    template: string;
    assets?: string[];
    productGroups?: string;
  }) => {
    const templateParam = `content_type=template&sys.id=${template}`;
    const assetsParam = `content_type=template&sys.id=${template}`;
    return `${host}/spaces/${space}/environments/${environment}/entries?access_token=${accessToken}&${templateParam}`;
  },
};

// contentful插件的默认选项
// const defaultOptions = {
//   host: `cdn.contentful.com`,
//   environment: `master`,
//   downloadLocal: false,
//   localeFilter: () => true,
//   contentTypeFilter: () => true,
//   pageLimit: 1000,
//   useNameForId: true,
//   enableTags: false,
//   typePrefix: `Contentful`,
// }

export const makeTypeName = (type: string, typePrefix: string) => {
  return _.upperFirst(_.camelCase(`${typePrefix} ${type}`));
};

const fetchJson = async (url: string) => {
  return await fetch(url).then((res) => res.json());
};

export const fetchContent = async (options: any) => {
  const { nextSyncUrl = "", pageLimit = 1000 } = options;

  let currentSyncData;
  let currentPageLimit = pageLimit;
  let lastCurrentPageLimit;
  let syncSuccess = false;
  let hasNext = true;
  let fullSyncData = {
    items: [],
    nextPageUrl: "",
  };

  while (!syncSuccess) {
    try {
      const url = fullSyncData.nextPageUrl
        ? fullSyncData.nextPageUrl + `&access_token=${accessToken}`
        : nextSyncUrl
          ? nextSyncUrl
          : urls.syncInitial();
      currentSyncData = await fetchJson(url);
      const items = fullSyncData.items.concat(currentSyncData.items);
      fullSyncData = { ...currentSyncData, items: items };
      console.log("fetch content:", url);
      if (!currentSyncData.nextPageUrl) {
        syncSuccess = true;
        hasNext = false;
      }
    } catch (e: any) {
      // Back off page limit if responses content length exceeds Contentfuls limits.
      if (
        e.response?.data?.message.includes(`Response size too big`) &&
        currentPageLimit > 1
      ) {
        lastCurrentPageLimit = currentPageLimit;
        // Reduce page limit by a arbitrary 1/3 of the current limit to ensure
        // the new and bigger entries are synced without exceeding the reponse size limit
        currentPageLimit = Math.floor((currentPageLimit / 3) * 2) || 1;
        console.warn(
          [
            `The sync with Contentful failed using pageLimit ${lastCurrentPageLimit} as the reponse size limit of the API is exceeded.`,
            `Retrying sync with pageLimit of ${currentPageLimit}`,
          ].join(`\n\n`),
        );
        continue;
      }
      throw e;
    }
    if (currentPageLimit !== pageLimit) {
      console.warn(
        `We recommend you to set your pageLimit in gatsby-config.js to ${currentPageLimit} to avoid failed synchronizations.`,
      );
    }
  }

  return fullSyncData;
};

// gatsby-source-contentful的请求过程
// 1. 校验参数(environment,space,token...)
// 2. 获取ContentTypes. 分页处理，返回items (以下称为contentTypeItems)
// 3. 获取locales的default值：defaultLocale = _.find(locales, { default: true }).code ?? 'en-US'
// 4. sync远端数据和缓存

// nextjs获取page数据
// 1. 根据slug获取pageAsset
// 2. 递归获取entries：template内的widget、assetContentGroups、productGroup(hardFilter)
// 3. 构建树状结构:

interface ContentfulEntry {
  sys: {
    id: string;
    contentType: {
      sys: {
        id: string;
      };
    };
  };
  fields: Record<string, any>;
  [key: string]: any;
}

const contentTypes = [
  {
    name: "FeatureSwitchConfig",
    id: "featureSwitchConfig",
  },
  {
    name: "PageTemplate",
    id: "pageTemplate",
  },
  {
    name: "ResultListWidget",
    id: "resultListWidget",
  },
  {
    name: "FieldValueProductGroup",
    id: "fieldValueProductGroup",
  },
  {
    name: "ContentKeyGroup",
    id: "contentKeyGroup",
  },
  {
    name: "HardFilterProductGroup",
    id: "hardFilterProductGroup",
  },
  {
    name: "TagProductGroup",
    id: "tagProductGroup",
  },
  {
    name: "CollectionProductGroup",
    id: "collectionProductGroup",
  },
  {
    name: "Variation Container",
    id: "variationContainer",
  },
  {
    name: "EmailTemplate",
    id: "emailTemplate",
  },
  {
    name: "ProductVariant",
    id: "productVariant",
  },
  {
    name: "ContentKey",
    id: "contentKey",
  },
  {
    name: "StaticAsset",
    id: "staticAsset",
  },
  {
    name: "AssetContentGroup",
    id: "assetContentGroup",
  },
  {
    name: "FunctionalWidget",
    id: "functionalWidget",
  },
  {
    name: "ProductAsset",
    id: "productAsset",
  },
  {
    name: "PageAsset",
    id: "pageAsset",
  },
  {
    name: "ContentGroup",
    id: "contentGroup",
  },
  {
    name: "Template",
    id: "template",
  },
  {
    name: "AssetContentWidget",
    id: "assetContentWidget",
  },
  {
    name: "StaticContentWidget",
    id: "staticContentWidget",
  },
  {
    name: "PromoTilesWidget",
    id: "promoTilesWidget",
  },
  {
    name: "ExternalReference",
    id: "externalReference",
  },
  {
    name: "PromoTile",
    id: "promoTile",
  },
  {
    name: "ReflektionWidget",
    id: "reflektionWidget",
  },
];

const collectionContentTypes = [
  {
    name: "AssetContentGroup",
    id: "assetContentGroup",
  },
  {
    name: "ContentGroup",
    id: "contentGroup",
  },
  {
    name: "Template",
    id: "template",
  },
  {
    name: "StaticContentWidget",
    id: "staticContentWidget",
  },
  {
    name: "PageAsset",
    id: "pageAsset",
  },
];

const fetchEntries = async (options: {
  ids: string[];
  idRecordPath?: string[];
  locale?: string;
}): Promise<ContentfulEntry[]> => {
  const {
    ids,
    locale,
    idRecordPath = [
      "fields.content",
      "fields.assets",
      "fields.assetContentGroups",
      "fields.productGroup",
      "fields.template",
    ],
  } = options;
  const itemsPath = "items";
  const idPath = "sys.id";
  const contentTypePath = "sys.contentType.sys.id";

  if (ids.length === 0) {
    return [];
  }

  // Fetch entries
  const res = await fetchJson(urls.entries(ids, locale));
  const entries = _.get<ContentfulEntry[]>(res, itemsPath, []);

  // Gets all subEntries in entries
  const subEntriesID = entries.map((entry) => {
    const contentType = _.get(entry, contentTypePath);
    if (collectionContentTypes.some((type) => type.id === contentType)) {
      return idRecordPath.map((path) => {
        const record = _.castArray(_.get(entry, path));
        return record.map((item) => _.get(item, idPath));
      });
    }
    return [];
  });

  const flattenSubEntriesID = subEntriesID.flat(3).filter(_.isString);
  const subEntries = await fetchEntries({
    ids: flattenSubEntriesID,
    idRecordPath,
    locale,
  });

  return [...entries, ...subEntries];
};

export const getContentfulEntries = async (slug: string) => {
  // const contentTypes = await fetch(urls.contentModel()).then((res) =>
  //   res.json(),
  // );

  const locales = await fetchJson(urls.locales());
  const locale = "en-CA" ?? _.find(locales?.items, { default: true })?.code;

  const pageType = "Browsing Page";
  const page = await fetchJson(urls.page(slug, locale, pageType));
  const pageID = _.get(page, "items[0].sys.id");
  const entries = await fetchEntries({ ids: [pageID], locale });

  const tree = buildContentfulPageTree(entries, pageID);

  return {
    // contentTypes: contentTypes?.items,
    locales: locales?.items,
    locale,
    page: _.first(page.items),
    tree,
    entries,
    entriesName: entries.map((entry) => _.get(entry, "fields.name")),
  };
};
