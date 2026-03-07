export const treeToFlatlist = (tree) => {
  const result = [];

  const loop = (data) => {
    data.forEach(item => {
      result.push(item);
      if (item.children) {
        loop(item.children);
      }
    });
  };

  loop(tree);
  return result;
};