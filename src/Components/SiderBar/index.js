import React, { useState, useRef, useEffect } from "react";
import { Layout, Avatar, Button } from "antd";
import { Link } from 'react-router-dom';
import './style.css';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    HomeOutlined,
    UserOutlined,
    DownOutlined,
    SettingOutlined,
    ShareAltOutlined,
    LockOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import { removeAllLocalStorage, logOut } from '../../util/Commons'
import logo from '../../assets/images/logo-white.png';
import { Image, Menu } from "antd";
import Context from "Data/Context";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";


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
    const { response: menuList, loading } = useSelector(
        (state) => state.common
    );
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
        <Layout>
            <Header
                className="headerbutton site-layout-background"
                style={{
                    padding: 0,
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                }}
            >
                {/* Logo and Title Section */}
                <div className="header-left">
                    <button className="btn-header-sider" onClick={() => setCollapsed(!collapsed)}>
                        {!collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                    </button>
                    {!collapsed ? <img src={logo} alt="logo" className="img-header-sider" /> : null}
                </div>
            </Header>
            <Content
                style={{
                    padding: 0,
                    position: 'sticky',
                }}
            >
                <Menu defaultSelectedKeys={['1']} mode="inline" items={activeMenu} onClick={handleClick} />
            </Content>
        </Layout>
    )
}
export default SiderBar;