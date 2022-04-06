import React, { useContext, useEffect, useState } from "react";
import { ArigatouContext } from "./../hardhat/SymfoniContext";
import { Navbar, Container, Button } from 'react-bootstrap';
import {BigNumber} from "ethers";

import 'bootstrap/dist/css/bootstrap.min.css';

interface Props {}

export const Arigatou: React.FC<Props> = () => {
  const arigatou = useContext(ArigatouContext);
  const [participated, setParticipated] = useState<boolean>(false);
  const [tokenAmount, setTokenAmount] = useState<BigNumber>(BigNumber.from(0));
  const [message, setMessage] = useState("");
  const [inputGreeting, setInputGreeting] = useState("");
  useEffect(() => {
    const doAsync = async () => {
      if (!arigatou.instance) return;
      arigatou.instance.on('Joined', joinedHandler);
    };
    doAsync();
  }, [arigatou]);

  const join = async () => {
    if (participated) return;
    if (!arigatou.instance) return;
    await arigatou.instance.join()
  };

  const joinedHandler = async (addr: string, index: BigNumber) => {
    if (!arigatou.instance) return;
    setParticipated(await arigatou.instance.isParticipated());
    setTokenAmount(await arigatou.instance.getCoinBalance());
    setMessage(String(await arigatou.instance.getCoinBalance()));
  }

  const withdraw = () => {
    if (!arigatou.instance) return;
    arigatou.instance.withdraw()
  }

  return (
    <div className="container">
      <Navbar bg="dark" variant="dark" fixed="top">
        <Container>
          <Navbar.Brand href="#">Arigatou System</Navbar.Brand>
          <Navbar.Text className="primary">ありがトークン：{ String(tokenAmount) } ARGT&nbsp;
            <Button variant="primary" onClick={ withdraw }>出金</Button>
          </Navbar.Text>
          {participated
            ? <Button variant="primary" disabled>ウォレット接続済</Button>
            : <Button variant="primary" onClick={ join }>ウォレット接続</Button>
          }
        </Container>
      </Navbar>
      <div className="mt-5 pt-5"></div>
      <div>
        <p>{message}</p>
        <Button variant="primary">プライマリーボタン</Button>
      </div>
    </div>
  );
};
