import React, { useEffect } from "react";

import { Card, Button, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import Context from "Data/Context";
import { FaServer, FaMicrochip, FaMemory, FaHdd, FaFan, FaPowerOff, FaNetworkWired, FaThermometerHalf } from 'react-icons/fa';
import { useSelector, useDispatch } from "react-redux";
import { fetchStart } from '../../util/CallAPI';


const stylesCardFn = info => {
    if (info.props.variant === 'outlined') {
        return {
            root: {
                borderColor: '#696FC7',
                boxShadow: '0 2px 8px #A7AAE1',
                borderRadius: 8,
            },
            extra: {
                color: '#696FC7',
            },
            title: {
                fontSize: 16,
                fontWeight: 500,
                color: '#A7AAE1',
            },
        };
    }
};

const ServerCard = ({ Server_Id, MaServer, title, status }) => {
    const { setOpenModal, setServerInfo } = React.useContext(Context);
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
    const formatValue = (label, val) => {
        if (val === "OK" || val === "WARNING" || val === "CRITICAL" || val === "Danger" || val === "N/A" || isNaN(val)) {
            return val;
        }
        const num = parseFloat(val);
        if (label === 'Temp') return `${num} °C`;
        if (label === 'Power') return `${num} W`;
        if (label === 'Fan') return `${num} RPM`;
        if (label === 'Network') return `${num} Mbps`;
        if (label === 'Storage') return `${num} GB`;
        return val;
    };

    const renderStatus = (label, value) => {
        let _value = value;
        if (value == "OK") _value = "ok"
        else if (value == "WARNING") _value = "warning"
        else if (value == "CRITICAL") _value = "error"
        else _value = "danger"
        
        const displayValue = formatValue(label, value);
        
        return (
            <div className="status-item" key={label}>
                {iconForLabel(label)}
                <span className="label">{label.toUpperCase()}:</span>{' '}
                <span className={`health-badge ${_value}`}>{displayValue}</span>
            </div>
        );
    };

    const checkStatus = (array, value) => {
        let status = "OK";
        if (!array || !Array.isArray(array)) return "N/A";

        for (const item of array) {
            if (item && item.moduleName && item.moduleName.includes(value)) {
                if (item.valueMonitor && item.valueMonitor !== 0) {
                    return item.valueMonitor;
                }
                status = item.status || status;
            }
        }

        return status;
    };

    return (
        <Card
            title={
                <div className="card-title"><FaServer className="server-icon" />{title}</div>
            }
            extra={
                <Tooltip title="Chi tiết">
                    <InfoCircleOutlined
                        style={{ fontSize: 18, color: '#1890ff', cursor: 'pointer' }}
                        onClick={() => {
                            setOpenModal(true);
                            setServerInfo(Server_Id);
                        }}
                    />
                </Tooltip>
            }
            variant="borderless"
            className={`card-server card-server-${status && status.length > 0 && status[0].status === "OK" ? "ok" : "nok"}`}>
            <div className="card-body">
                <div className="status-list">
                    {renderStatus('CPU', checkStatus(status, "Processor"))}
                    {renderStatus('RAM', checkStatus(status, "Memory"))}
                    {renderStatus('Storage', checkStatus(status, "Disk"))}
                    {renderStatus('Fan', checkStatus(status, "Fan"))}
                    {renderStatus('Power', checkStatus(status, "PWR"))}
                    {renderStatus('Network', checkStatus(status, "NIC"))}
                    {renderStatus('Temp', checkStatus(status, "CPU1 Temp"))}
                </div>
            </div>
        </Card>
    );
}
export default ServerCard;
