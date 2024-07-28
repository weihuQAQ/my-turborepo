import _ from "lodash";

interface Entry {
  sys: {
    id: string;
  };
  fields: {
    [k: string]: any;
  };
}

export const buildContentfulPageTree = (data: Entry[], rootID: string) => {
  const idMap: Record<string, Entry> = {};
  const root = {};
  const collectionFields = ["assetContentGroups", "content", "assets"];
  const singleFields = ["template", "productGroup"];

  data.forEach((item) => {
    const { id } = item.sys;
    idMap[id] = { ...item };
  });

  data.forEach((item) => {
    const { id } = item.sys;

    collectionFields.forEach((fieldName) => {
      const fieldValue = item.fields?.[fieldName];
      const entry = idMap[id];
      if (_.isArray(fieldValue) && entry) {
        entry.fields[fieldName] = fieldValue.map(
          (child) => idMap[child.sys.id],
        );
      }
    });

    singleFields.forEach((fieldName) => {
      const fieldValue = item.fields?.[fieldName];
      const entry = idMap[id];
      if (fieldValue && entry) {
        entry.fields[fieldName] = idMap[fieldValue.sys.id];
      }
    });

    // Set root element
    if (id === rootID) {
      Object.assign(root, idMap[id]);
    }
  });

  return root;
};
