import React, { useContext, useEffect, useState } from "react";
import { ArigatouContext, CurrentAddressContext } from "./../hardhat/SymfoniContext";
import { Navbar, Container, Button, Table, Modal, Form, Dropdown, Card, CardGroup } from 'react-bootstrap';
import {BigNumber} from "ethers";
import { TransactionResponse } from "@ethersproject/abstract-provider";

import '../Arigatou.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { use } from "chai";
import { send } from "process";

interface Props {}

interface UserContext {
  name: string,
  address: string
}

export const Arigatou: React.FC<Props> = () => {
  const arigatou = useContext(ArigatouContext);
  const [currentAddress] = useContext(CurrentAddressContext);
  const [show, setShow] = useState<boolean>(false);
  const [sendUser, setSendUser] = useState<UserContext>();
  const [sendAmount, setSendAmount] = useState<BigNumber>(BigNumber.from(0));
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

  const onClick = (user: UserContext) => {
    setSendUser(user);
    setShow(true);
  }

  const onChange = (str: string) => {
    setSendAmount(BigNumber.from(Number(str)));
  }

  const handleSend = () => {
    console.log(sendAmount);
    if (!arigatou.instance) return;
    if (!sendUser) return;
    arigatou.instance.transfer(sendUser.address, sendAmount)
      .then((tx: TransactionResponse) => tx.wait())
      .then(async () => {
        if (!arigatou.instance) return;
        setTokenAmount(await arigatou.instance.getCoinBalance());
        setShow(false);
      })
  }

  const handleCancel = () => {
    setShow(false);
  }

  return (
    <div className="container">
      <Navbar variant="light" fixed="top" className="arigatou_navbar">
          <Navbar.Brand href="#" className="ms-3">
            <img
            alt=""
            src="/heart.png"
            width="30"
            height="30"
            />{' '}
            Send a Heart
          </Navbar.Brand>
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text className="me-5">ポイント: { String(tokenAmount) } &nbsp;
              <Button variant="info">購入</Button>
            </Navbar.Text>
            <Navbar.Text className="me-5">DIT: { String(tokenAmount) } &nbsp;
              <Button variant="info" onClick={ withdraw }>出金</Button>
            </Navbar.Text>
            <Navbar.Text className="me-1">コミュニティ:</Navbar.Text>
            <Dropdown className="me-3">
              <Dropdown.Toggle variant="info">
                devillage Discord
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="#/action-1">devillage Discord</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Astar Network Discord</Dropdown.Item>
                <Dropdown.Item href="#/action-3">Development department</Dropdown.Item>
                <Dropdown.Item href="#/action-3">5th Grade, Class 1</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            {participated
              ? <Button variant="outline-info" className="me-3" disabled>ウォレット接続済</Button>
              : <Button variant="info" className="me-3" onClick={ join }>ウォレット接続</Button>
            }
        </Navbar.Collapse>
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
                    <td><Button variant="info" onClick={() => onClick(user)}>送付</Button></td>
                  </tr>
                )
              }
            })}
          </tbody>
        </Table>
      </div>
      <Modal show={show} onHide={handleCancel}>
        <Modal.Header closeButton>
          <Modal.Title>{sendUser?.name}にありがとうを送る</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>ポイント: {String(tokenAmount)}</p>
          <CardGroup>
            <Card style={{ width: '18rem' }} className="text-center">
              <Card.Img variant="top" style={{ width: '80%' }} className="arigatou_card mt-3" src="/heart.png" />
              <Card.Body>
                <Button variant="info">150 Pts.</Button>
              </Card.Body>
            </Card>
            <Card style={{ width: '18rem' }} className="text-center">
              <Card.Img variant="top" style={{ width: '80%' }} className="arigatou_card mt-3" src="/heart.png" />
              <Card.Body>
                <Button variant="info">300 Pts.</Button>
              </Card.Body>
            </Card>
            <Card style={{ width: '18rem' }} className="text-center">
              <Card.Img variant="top" style={{ width: '80%' }} className="arigatou_card mt-3" src="/heart.png" />
              <Card.Body>
                <Button variant="info">450 Pts.</Button>
              </Card.Body>
            </Card>
          </CardGroup>
        </Modal.Body>
      </Modal>
      <Modal show={false} onHide={handleCancel}>
        <Modal.Header closeButton>
          <Modal.Title>{sendUser?.name}に送金</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control placeholder="ARGT" onChange={(e) => onChange(e.target.value)} autoFocus />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={handleSend}>
            送付
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
