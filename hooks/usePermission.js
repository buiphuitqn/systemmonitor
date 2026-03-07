import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { treeToFlatlist } from "../util/menuHelper";
export const usePermission = () => {

    const { response: menus, loading } = useSelector(
            (state) => state.common
        );
    const location = useLocation();

    const path = location.pathname.replace(/^\/+/, "");

    const flatMenus = treeToFlatlist(menus["menuList"]);

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