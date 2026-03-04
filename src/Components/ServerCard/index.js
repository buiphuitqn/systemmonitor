import React,{ useEffect } from "react";
import './style.css';
import { Card, Button } from "antd";
import Context from "Data/Context";
import { FaServer, FaMicrochip, FaMemory, FaHdd, FaFan, FaPowerOff, FaNetworkWired, FaThermometerHalf } from 'react-icons/fa';
import { useSelector, useDispatch } from "react-redux";
import { fetchStart } from '../../appRedux/features/common/commonSlice';



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

const ServerCard = ({ Server_Id, MaServer, title }) => {
    const { setOpenModal, setServerInfo } = React.useContext(Context);
    const dispatch = useDispatch();
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
    const overallHealth = () => {
        const healthLevels = { critical: 3, warning: 2, ok: 1 };
        let max = 0;
        if (max === 3) return 'critical';
        if (max === 2) return 'warning';
        return 'ok';
    };

    const healthClass = overallHealth();
    const renderStatus = (label, value) => {
        return (
            <div className="status-item" key={label}>
                {iconForLabel(label)}
                <span className="label">{label.toUpperCase()}:</span>{' '}
                <span className={`health-badge ${value.toLowerCase()}`}>{value}</span>
            </div>
        );
    };

    const { response: serverInfo, loading } = useSelector(
        (state) => state.common
    );
    useEffect(() => {
        dispatch(
            fetchStart({
                key: 'serverInfo',
                url: "/api/StatusModule/GetbyServerId",
                method: "GET",
                params: {
                    serverId: Server_Id
                },
            })
        );
    }, [dispatch]);



    return (
        <Card
            title={
                <div className="card-title"><FaServer className="server-icon" />{title}</div>
            }
            extra={<Button type="link" onClick={() => {
                setOpenModal(true);
                setServerInfo(title);
            }}>More</Button>}
            variant="borderless"
            className="card-server">
            <div className="card-body">
                {console.log("Render ServerCard with serverInfo:", serverInfo)}
                <div className="status-list">
                    {renderStatus('CPU', 'OK')}
                    {renderStatus('RAM', 'OK')}
                    {renderStatus('Storage', 'OK')}
                    {renderStatus('Fan', 'OK')}
                    {renderStatus('Power', 'OK')}
                    {renderStatus('Network', 'WARNING')}
                    {renderStatus('Temp', 'CRITICAL')}
                </div>
            </div>
        </Card>
    );
}
export default ServerCard;