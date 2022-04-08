import React, { useContext, useEffect, useState } from "react";
import { ArigatouContext, CurrentAddressContext } from "./../hardhat/SymfoniContext";
import { Navbar, Container, Button, Table } from 'react-bootstrap';
import {BigNumber} from "ethers";
import { TransactionResponse } from "@ethersproject/abstract-provider";

import 'bootstrap/dist/css/bootstrap.min.css';

interface Props {}

export const Arigatou: React.FC<Props> = () => {
  const arigatou = useContext(ArigatouContext);
  const [currentAddress] = useContext(CurrentAddressContext);

  const [participated, setParticipated] = useState<boolean>(false);
  const [tokenAmount, setTokenAmount] = useState<BigNumber>(BigNumber.from(0));
  const [message, setMessage] = useState("");
  const [inputGreeting, setInputGreeting] = useState("");
  useEffect(() => {
    const doAsync = async () => {
      if (!arigatou.instance) return;
      const c_participated = await arigatou.instance.isParticipated();
      setParticipated(c_participated);
      if (c_participated) {
        setTokenAmount(await arigatou.instance.getCoinBalance());
        setMessage(String(await arigatou.instance.getParticipantNum()));

        let users : { 0: string[], 1: string[] };
        users = await arigatou.instance.getUsers();
        setMessage(users[0][0]);
      }
    };
    doAsync();
  }, [arigatou]);

  const join = () => {
    if (participated) return;
    if (!arigatou.instance) return;
    arigatou.instance.join('NewUser')
      .then((tx: TransactionResponse) => tx.wait())
      .then(async () => {
        if (!arigatou.instance) return;
        setParticipated(await arigatou.instance.isParticipated());
        setTokenAmount(await arigatou.instance.getCoinBalance());
        setMessage(String(await arigatou.instance.getParticipantNum()));
      })
  };

  const joinedHandler = async (addr: string, index: BigNumber) => {
    if (!arigatou.instance) return;
    if (addr != currentAddress) return;
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
      <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Username</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Mark</td>
              <td>Otto</td>
              <td>@mdo</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Jacob</td>
              <td>Thornton</td>
              <td>@fat</td>
            </tr>
            <tr>
              <td>3</td>
              <td colSpan={2}>Larry the Bird</td>
              <td>@twitter</td>
            </tr>
          </tbody>
        </Table>
        <p>{message}</p>
        <Button variant="primary">プライマリーボタン</Button>
      </div>
    </div>
  );
};
