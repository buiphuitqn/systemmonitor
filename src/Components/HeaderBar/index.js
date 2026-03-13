import React, { useState, useRef, useEffect } from "react";
import { Layout, Avatar } from "antd";
import { Link } from 'react-router-dom';
import {
  UserOutlined,
  DownOutlined,
  SettingOutlined,
  ShareAltOutlined,
  LockOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { removeAllLocalStorage, logOut } from '../../util/Commons'
import Profile from "../Profile";
// import logo from '../../assets/images/logo-white.png';
import { Image } from "antd";

const { Header } = Layout;

// User Dropdown Component
const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="user-dropdown-container" ref={dropdownRef}>
      <div
        className="user-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar
          style={{ backgroundColor: "#00529C" }}
          size={36}
          icon={<UserOutlined />}
        />
      </div>

      {isOpen && (
        <div className="user-menu">
          <div className="user-profile-header">
            <Avatar
              style={{ backgroundColor: "#00529C" }}
              size={48}
              icon={<UserOutlined />}
            />
            <div className="user-info">
              <p className="user-name">Bùi Ngọc Phú</p>
              <p className="user-email">buingocphu@thaco.com.vn</p>
            </div>
          </div>

          <div className="user-menu-divider"></div>

          <div className="user-menu-items">
            <div className="user-menu-item">
              <SettingOutlined className="user-menu-icon" />
              <span>Settings</span>
            </div>
            <div className="user-menu-item">
              <ShareAltOutlined className="user-menu-icon" />
              <span>Share</span>
            </div>
            <div className="user-menu-item">
              <LockOutlined className="user-menu-icon" />
              <span>Change Password</span>
            </div>
          </div>

          <div className="user-menu-divider"></div>

          <button className="user-logout-btn" onClick={() => logOut()}>
            <LogoutOutlined className="logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

const HeaderBar = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const navRef = useRef(null);


  // Handle click outside to close menus
  useEffect(() => {
  }, []);

  return (
    <>
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
          <div className="app-title">
            <p>THACO SYSTEM MONITOR</p>
          </div>
        </div>

        {/* User Section */}
        <div className="header-right">
          <Profile />
          {/* <UserDropdown /> */}
        </div>
      </Header>
    </>
  );
}
export default HeaderBar;