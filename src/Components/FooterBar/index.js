import React from "react";
import './style.css';

const FooterBar = () => {
    return (
        <div
            className="footer-main"
            style={{
                padding: 0,
                position: 'sticky',
                bottom: 0,
                zIndex: 1000,
            }}>Ứng dụng được phát triển bởi: Bùi Ngọc Phú</div>
    )
};
export default FooterBar;