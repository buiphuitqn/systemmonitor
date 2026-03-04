import React from "react";
const dataStorage = JSON.parse(window.localStorage.getItem("username"));
const initialState = () => {
  if (dataStorage) {
    return dataStorage;
  } else {
    window.localStorage.setItem("username", JSON.stringify([]));
    return [];
  }
};
export default function () {
    const [login, setLogin] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [serverInfo, setServerInfo] = React.useState(null);
    const intialState = {
        login,
        setLogin,
        username,
        setUsername,
        loading,
        setLoading,
        openModal, setOpenModal,
        serverInfo, setServerInfo
    };
    return { intialState };
}