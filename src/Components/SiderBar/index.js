import React, { useState, useRef, useEffect } from "react";
import { Layout, Avatar, Button } from "antd";
import { Link } from 'react-router-dom';
import './style.css';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    HomeOutlined,
    UserOutlined,
    SettingOutlined,
    ShareAltOutlined,
    LockOutlined,
    LogoutOutlined,
    QuestionCircleOutlined,
    ReadOutlined
} from "@ant-design/icons";
import { getLocalStorage, logOut } from '../../util/Commons'
import logo from '../../assets/images/logo.png';
import { Image, Menu } from "antd";
import Context from "Data/Context";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Profile from "../Profile";


const { Header, Content } = Layout;

const iconForLabel = label => {
    const key = label.toLowerCase();
    switch (key) {
        case 'home': return <HomeOutlined />;
        case 'user': return <UserOutlined />;
        case 'setting': return <SettingOutlined />;
        case 'share': return <ShareAltOutlined />;
        case 'lock': return <LockOutlined />;
        case 'logout': return <LogoutOutlined />;
        default: return <MenuUnfoldOutlined />;
    }
};


const convertToAntMenu = (menus) => {
    return menus.map(m => ({
        key: "/" + m.url,
        icon: iconForLabel(m.icon),
        label: m.tenMenu,
        children: m.children?.length ? convertToAntMenu(m.children) : null
    }));
};

const buildMenuTree = (data) => {
    const map = {};
    const roots = [];
    data.forEach(item => {
        map[item.id] = { ...item, children: [] };
    });

    data.forEach(item => {
        if (item.parent_Id) {
            map[item.parent_Id]?.children.push(map[item.id]);
        } else {
            roots.push(map[item.id]);
        }
    });
    return roots;
};

const SiderBar = () => {
    const navigate = useNavigate();
    const { collapsed, setCollapsed } = React.useContext(Context);
    const [activeMenu, setActiveMenu] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const { response: menuList, loading } = useSelector(
        (state) => state.common
    );

    useEffect(() => {
        const info = getLocalStorage('userInfo');
        if (info) setUserInfo(info);
    }, []);
    useEffect(() => {
        if (menuList["menuList"]) {
            const tree = buildMenuTree(menuList["menuList"]);
            const antMenu = convertToAntMenu(tree);
            setActiveMenu(antMenu);
        }
    }, [menuList]);

    const handleClick = (e) => {
        let url = e.key;

        if (!url.startsWith("/")) {
            url = "/" + url;
        }

        navigate(url);
    };
    return (
        <Layout className="sider-layout-container">
            <Header
                className="headerbutton site-layout-background sider-header"
            >
                <div className="header-left">
                    <button className="btn-header-sider" onClick={() => setCollapsed(!collapsed)}>
                        {!collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                    </button>
                    {!collapsed ? <p>SYSTEM MONITOR</p> : null}
                </div>
            </Header>

            <Content className="sider-menu-content">
                <Menu defaultSelectedKeys={['1']} mode="inline" items={activeMenu} onClick={handleClick} />
            </Content>

            <div className="sider-footer">
                <Profile collapsed={collapsed} />
            </div>
        </Layout>
    )
}
export default SiderBar;