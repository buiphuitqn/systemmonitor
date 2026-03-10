import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { treeToFlatlist } from "../util/menuHelper";

export const usePermission = () => {
  const menuListResponse = useSelector(state => state.common.response?.menuList);
  const menus = menuListResponse || [];
  
  const location = useLocation();

  const path = location.pathname.replace(/^\/+/, "");

  const flatMenus = treeToFlatlist(menus);
  const menu = flatMenus.find(x => x.url === path);

  const permission = menu?.permission || {
    add: false,
    edit: false,
    del: false,
    view: true
  };

  return {
    permission,
    menu
  };
};