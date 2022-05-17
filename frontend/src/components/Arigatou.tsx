import React, { useContext, useEffect, useState } from "react";
import { ArigatouContext, CurrentAddressContext } from "./../hardhat/SymfoniContext";
import { Navbar, Button, Table, Modal, Form, Dropdown, Card, CardGroup, Image, Spinner } from 'react-bootstrap';
import {BigNumber} from "ethers";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Arigatou.css';

interface UserContext {
  rank: number,
  name: string,
  address: string
  receivedPts: number
}

export enum SequenceStatus {
  NOT_PARTICIPATE,
  SELECT_USER,
  SELECT_IMAGE,
  BEFORE_INPUT_MESSAGE,
  INPUT_MESSAGE,
  CONFIRM,
  SENDING,
  SENDING_COMPLETE
}

export const Arigatou: React.FC = () => {
  const arigatou = useContext(ArigatouContext);
  const [currentAddress] = useContext(CurrentAddressContext);
  const [sendUser, setSendUser] = useState<UserContext>();
  const [participated, setParticipated] = useState<boolean>(false);
  const [ptBalance, setPtBalance] = useState<BigNumber>(BigNumber.from(0));
  const [ditBalance, setDitBalance] = useState<BigNumber>(BigNumber.from(0));
  const [users, setUsers] = useState<UserContext[]>();
  const [sequence, setSequence] = useState<SequenceStatus>(SequenceStatus.NOT_PARTICIPATE);
  const [totalReceivedPts, setTotalReceivedPts] = useState<BigNumber>(BigNumber.from(0));
  
  useEffect(() => {
    const doAsync = async () => {
      if (!arigatou.instance) return;

      // 参加済みかどうか
      const c_participated = await arigatou.instance.isParticipated();
      setParticipated(c_participated);

      // 参加済みの場合
      if (c_participated) {
        setPtBalance(await arigatou.instance.getPtBalance());
        setDitBalance(await arigatou.instance.getDitBalance());
        setTotalReceivedPts(await arigatou.instance.getTotalReceivedPts());
        updateUsers();
      }
    };
    doAsync();
  }, [arigatou]);

  const updateUsers = async () => {
    if (!arigatou.instance) return;

    // スマートコントラクトのユーザー情報取得
    let users : { 0: string[], 1: string[], 2: BigNumber[] };
    users = await arigatou.instance.getUsers();

    // フロントエンド用ユーザー情報に変換
    let c_users : UserContext[] = new Array(users[0].length);
    for (let i = 0; i < users[0].length; i++ ) {
      c_users[i] = { rank: 0, name: users[0][i], address: users[1][i], receivedPts: Number(users[2][i]) };
    }

    // 受領Pts.の降順にソート
    c_users.sort((a: UserContext, b: UserContext) => {
      if (a.receivedPts > b.receivedPts) return -1;
      if (a.receivedPts == b.receivedPts) return 0;
      return 1;
    })

    // 順位設定
    for (let i = 0; i < users[0].length; i++ ) {
      c_users[i].rank = i + 1
    }

    setUsers(c_users);
  }

  const withdrawDit = () => {
    if (!arigatou.instance) return;

    arigatou.instance.withdrawDit()
      .then((tx: TransactionResponse) => tx.wait())
      .then(async () => {
        if (!arigatou.instance) return;
        setDitBalance(await arigatou.instance.getDitBalance());
      })
  }

  const onSelectUser = (user: UserContext) => {
    setSendUser(user);
    setSequence(SequenceStatus.BEFORE_INPUT_MESSAGE);
  }

  const onSelectImage = () => {
    setSequence(SequenceStatus.INPUT_MESSAGE);
  }

  const onInputMessage = () => {
    setSequence(SequenceStatus.CONFIRM);
  }

  const onConfirm = () => {
    if (!arigatou.instance) return;
    if (!sendUser) return;
    setSequence(SequenceStatus.SENDING);
    arigatou.instance.giveNft(sendUser.address, "http://localhost:3000/normal.png", 150)
      .then((tx: TransactionResponse) => tx.wait())
      .then(async () => {
        if (!arigatou.instance) return;
        updateUsers();
        setPtBalance(await arigatou.instance.getPtBalance());
        setTotalReceivedPts(await arigatou.instance.getTotalReceivedPts());
        setDitBalance(await arigatou.instance.getDitBalance());
        setSequence(SequenceStatus.SENDING_COMPLETE);
      })
  }

  const onSendingComplete = () => {
    setSequence(SequenceStatus.SELECT_USER);
  }

  const onCancelSelectImage = () => {
    setSequence(SequenceStatus.SELECT_USER);
  }

  const onCancelInputMessage = () => {
    setSequence(SequenceStatus.SELECT_IMAGE);
  }

  const onCancelConfirm = () => {
    setSequence(SequenceStatus.INPUT_MESSAGE);
  }

  const reset = () => {
    if (!arigatou.instance) return;
    arigatou.instance.resetDemo()
      .then((tx: TransactionResponse) => tx.wait())
      .then(async () => {
        if (!arigatou.instance) return;
        setPtBalance(await arigatou.instance.getPtBalance());
      });
  }

  return (
    <div className="container">
      <Navbar variant="light" fixed="top" className="arigatou_navbar">
          <Navbar.Brand href="#" className="ms-3">
            <img
            alt=""
            src="/normal.png"
            width="30"
            height="30"
            />{' '}
            Send a Heart
          </Navbar.Brand>
          <Navbar.Collapse className="ms-5">
            <Navbar.Text className="text-dark me-1">Community:</Navbar.Text>
              <Dropdown>
                <Dropdown.Toggle variant="info text-light">
                  devillage Discord
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="#/action-1">devillage Discord</Dropdown.Item>
                  <Dropdown.Item href="#/action-2">Astar Network Discord</Dropdown.Item>
                  <Dropdown.Item href="#/action-3">Development department</Dropdown.Item>
                  <Dropdown.Item href="#/action-3">5th Grade, Class 1</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            <Navbar.Text className="text-dark ms-3">Total generated hearts (Pts.): <span className="text-primary">{ String(totalReceivedPts )}</span></Navbar.Text>
          </Navbar.Collapse>
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text className="text-dark me-3">Pts.: { String(ptBalance) } &nbsp;
              <Button variant="info text-light">Purchase</Button>
            </Navbar.Text>
            <Navbar.Text className="text-dark me-3">DIT: { String(ditBalance) } &nbsp;
              <Button variant="info text-light" onClick={ withdrawDit }>Withdraw</Button>
            </Navbar.Text>
            {participated
              ? <Button variant="outline-info" className="me-3" disabled>Connected</Button>
              : <Button variant="info text-light" className="me-3">Connect</Button>
            }
        </Navbar.Collapse>
      </Navbar>
      <div className="mt-5 pt-5"></div>
      <div>
      <Table striped bordered hover>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Address</th>
              <th>Received (Pts.)</th>
              <th>Heart</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user, index) => {
              return (
                <tr key={index} v-for="user in users">
                  <td>{user.rank}</td>
                  <td>{user.name}</td>
                  <td>{user.address}</td>
                  <td>{user.receivedPts}</td>
                  <td>
                    {user.address == currentAddress
                      ? <Button variant="outline-info" disabled>Send</Button>
                      : <Button variant="info text-light" onClick={() => onSelectUser(user)}>Send</Button>
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>
      <Modal show={sequence == SequenceStatus.SELECT_IMAGE} aria-labelledby="contained-modal-title-vcenter" centered dialogClassName="arigatou_confirm" onHide={onCancelSelectImage}>
        <Modal.Header closeButton>
          <Modal.Title>Send a heart to {sendUser?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card.Text>Choose a heart! (You have {String(ptBalance)} Pts.)</Card.Text>
          <CardGroup>
            <Card className="text-center">
              <Card.Img variant="top"  style={{ width: '90%' }} className="arigatou_card mt-3" src="/green.png" />
              <Card.Body>
                <Button variant="outline-info" disabled>90 Pts.</Button>
                <Card.Text className="text-danger small">Comming soon.</Card.Text>
              </Card.Body>
            </Card>
            <Card className="text-center">
              <Card.Img variant="top"  style={{ width: '90%' }} className="arigatou_card mt-3" src="/normal.png" />
              <Card.Body>
                <Button variant="info text-light" onClick={() => onSelectImage()}>150 Pts.</Button>
              </Card.Body>
            </Card>
            <Card className="text-center">
              <Card.Img variant="top"  style={{ width: '90%' }} className="arigatou_card mt-3" src="/kirakira.png" />
              <Card.Body>
                <Button variant="outline-info" disabled>200 Pts.</Button>
                <Card.Text className="text-danger small">Comming soon.</Card.Text>
              </Card.Body>
            </Card>
          </CardGroup>
        </Modal.Body>
      </Modal>
      <Modal show={sequence == SequenceStatus.BEFORE_INPUT_MESSAGE} onEnter={() => setSequence(SequenceStatus.SELECT_IMAGE)}></Modal>
      <Modal show={sequence == SequenceStatus.INPUT_MESSAGE} aria-labelledby="contained-modal-title-vcenter" centered onHide={onCancelSelectImage}>
        <Modal.Header closeButton>
          <Modal.Title>Send a heart to {sendUser?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card.Text>Put your message!</Card.Text>
          <Form>
            <Form.Control type="text" autoFocus />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onCancelInputMessage}>
            Back
          </Button>
          <Button variant="info text-light" onClick={onInputMessage}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={sequence == SequenceStatus.CONFIRM} aria-labelledby="contained-modal-title-vcenter" centered dialogClassName="arigatou_confirm" onHide={onCancelSelectImage}>
        <Modal.Header closeButton>
          <Modal.Title>Send a heart to {sendUser?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card.Text>Would you like to send this heart?</Card.Text>
          <Image className="arigatou_nft" style={{width: '50rem'}} src="/sample_nft.png"></Image>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onCancelConfirm}>
            Back
          </Button>
          <Button variant="info text-light" onClick={onConfirm}>
            Send
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={sequence == SequenceStatus.SENDING} aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header>
          <Modal.Title>Send a heart to {sendUser?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card.Text>Sending a heart...</Card.Text>
          <div className="text-center">
            <Spinner animation="border" role="status"></Spinner>
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={sequence == SequenceStatus.SENDING_COMPLETE} aria-labelledby="contained-modal-title-vcenter" centered onHide={onCancelSelectImage}>
        <Modal.Header closeButton>
          <Modal.Title>You have sent a heart to {sendUser?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card.Text>You have got <span className="text-danger">15</span> DIT!</Card.Text>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="info text-light" onClick={onSendingComplete}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
      <Button variant="outline-dark" onClick={ reset }>Reset</Button>
    </div>
  );
};
