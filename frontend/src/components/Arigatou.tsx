import React, { useContext, useEffect, useState } from "react";
import { ArigatouContext } from "./../hardhat/SymfoniContext";

interface Props {}

export const Arigatou: React.FC<Props> = () => {
  const arigatou = useContext(ArigatouContext);
  const [message, setMessage] = useState("");
  const [inputGreeting, setInputGreeting] = useState("");
  useEffect(() => {
    const doAsync = async () => {
      if (!arigatou.instance) return;
      console.log("Arigatou is deployed at ", arigatou.instance.address);
      setMessage(String(await arigatou.instance.getCoinBalance()));
    };
    doAsync();
  }, [arigatou]);

  return (
    <div>
      <p>{message}</p>
    </div>
  );
};
