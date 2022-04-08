import React, { useContext, useEffect, useState } from "react";
import { ArigatouContext, CurrentAddressContext } from "./../hardhat/SymfoniContext";
import { Navbar, Container, Button, Table, Modal, Form } from 'react-bootstrap';
import {BigNumber} from "ethers";
import { TransactionResponse } from "@ethersproject/abstract-provider";

import 'bootstrap/dist/css/bootstrap.min.css';
import { use } from "chai";

interface Props {}

interface UserContext {
  name: string,
  address: string
}

export const Arigatou: React.FC<Props> = () => {
  const arigatou = useContext(ArigatouContext);
  const [currentAddress] = useContext(CurrentAddressContext);
  const [show] = useState<boolean>(false);
  const [participated, setParticipated] = useState<boolean>(false);
  const [tokenAmount, setTokenAmount] = useState<BigNumber>(BigNumber.from(0));
  const [message, setMessage] = useState("");
  const [inputGreeting, setInputGreeting] = useState("");
  const [users, setUsers] = useState<UserContext[]>();
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
        let c_users : UserContext[] = new Array(users[0].length);
        for (let i = 0; i < users[0].length; i++ ) {
          c_users[i] = { name: users[0][i], address: users[1][i] };
        }
        setUsers(c_users);
        setMessage(c_users[0].name + ' : ' + c_users[0].address);
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

  const onClick = (addr: string) => {
    console.log(addr);
  }

  const handleClose = () => {

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
              <th>ユーザー名</th>
              <th>アドレス</th>
              <th>送付</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user, index) => {
              if (user.address != currentAddress) {
                return (
                  <tr key={index} v-for="user in users">
                    <td>{user.name}</td>
                    <td>{user.address}</td>
                    <td><Button onClick={() => onClick(user.address)}>送付</Button></td>
                  </tr>
                )
              }
            })}
          </tbody>
        </Table>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="name@example.com"
                autoFocus
              />
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Example textarea</Form.Label>
              <Form.Control as="textarea" rows={3} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
