import React from "react";

import { Descriptions } from "antd";
import { FaMicrochip, FaMemory, FaHdd, FaFan, FaPowerOff, FaNetworkWired, FaThermometerHalf } from 'react-icons/fa';

const ItemStatus = ({ item, status, timestamp, valueMonitor }) => {
    const statusClass = status.toLowerCase();
    return (
        <div className="item-status-card">
            <div className="item-status-content">
                <p>{item.toUpperCase()}</p>
                <Descriptions
                    column={1}
                    size="small">
                    <Descriptions.Item label="Status:"><span className={`health-badge ${statusClass}`}>
                        {status}
                    </span>
                        {valueMonitor ? `(Value: ${valueMonitor})` : ''}
                    </Descriptions.Item>
                    <Descriptions.Item label="TimeStamp">{timestamp ? new Date(timestamp.endsWith('Z') ? timestamp : timestamp + 'Z').toLocaleString('vi-VN') : 'N/A'}</Descriptions.Item>
                </Descriptions>
            </div>
        </div>
    );
}
export default ItemStatus;
