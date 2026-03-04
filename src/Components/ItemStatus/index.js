import React from "react";
import { FaMicrochip, FaMemory, FaHdd, FaFan, FaPowerOff, FaNetworkWired, FaThermometerHalf } from 'react-icons/fa';

const ItemStatus = ({ item, status }) => {
    const statusClass = status.toLowerCase();
    const iconForLabel = label => {
        const key = label.toLowerCase();
        switch (key) {
            case 'cpu': return <FaMicrochip className="status-icon" />;
            case 'ram': return <FaMemory className="status-icon" />;
            case 'storage': return <FaHdd className="status-icon" />;
            case 'fan': return <FaFan className="status-icon" />;
            case 'power': return <FaPowerOff className="status-icon" />;
            case 'network': return <FaNetworkWired className="status-icon" />;
            case 'temp': return <FaThermometerHalf className="status-icon" />;
            default: return null;
        }
    };
    return (
        <div>
            {iconForLabel(item)}
            <span className="label">{item.toUpperCase()}:</span>{' '}
            <span className={`health-badge ${statusClass}`}>
                {status}
            </span>
        </div>
    );
}
export default ItemStatus;