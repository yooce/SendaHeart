import React, { useContext, useEffect, useState } from "react";
import { ArigatouContext, CurrentAddressContext } from "./../hardhat/SymfoniContext";
import { Navbar, Container, Button, Table, Modal, Form, Dropdown, Card, CardGroup, Image } from 'react-bootstrap';
import { BsArrowLeft } from "react-icons/bs";
import {BigNumber} from "ethers";
import { TransactionResponse } from "@ethersproject/abstract-provider";

import '../Arigatou.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { use } from "chai";
import { send } from "process";
import { DH_NOT_SUITABLE_GENERATOR } from "constants";

interface Props {}

interface UserContext {
  name: string,
  address: string
  receipt: BigNumber
}

export enum SequenceStatus {
  NOT_PARTICIPATE,
  SELECT_USER,
  SELECT_IMAGE,
  INPUT_MESSAGE,
  CONFIRM,
  SENDING,
  SENDING_COMPLETE
}

export const Arigatou: React.FC<Props> = () => {
  const arigatou = useContext(ArigatouContext);
  const [currentAddress] = useContext(CurrentAddressContext);
  const [sendUser, setSendUser] = useState<UserContext>();
  const [message, setMessage] = useState<string>('');
  const [participated, setParticipated] = useState<boolean>(false);
  const [tokenAmount, setTokenAmount] = useState<BigNumber>(BigNumber.from(0));
  const [users, setUsers] = useState<UserContext[]>();
  const [sequence, setSequence] = useState<SequenceStatus>(SequenceStatus.NOT_PARTICIPATE);
  useEffect(() => {
    const doAsync = async () => {
      if (!arigatou.instance) return;
      const c_participated = await arigatou.instance.isParticipated();
      setParticipated(c_participated);
      if (c_participated) {
        setTokenAmount(await arigatou.instance.getCoinBalance());

        let users : { 0: string[], 1: string[] };
        users = await arigatou.instance.getUsers();
        let c_users : UserContext[] = new Array(users[0].length);
        for (let i = 0; i < users[0].length; i++ ) {
          c_users[i] = { name: users[0][i], address: users[1][i], receipt: BigNumber.from(i)};
        }
        setUsers(c_users);
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
      })
  };

  const joinedHandler = async (addr: string, index: BigNumber) => {
    if (!arigatou.instance) return;
    if (addr != currentAddress) return;
    setParticipated(await arigatou.instance.isParticipated());
    setTokenAmount(await arigatou.instance.getCoinBalance());
  }

  const withdraw = () => {
    if (!arigatou.instance) return;
    arigatou.instance.withdraw()
  }

  const onSelectUser = (user: UserContext) => {
    setSendUser(user);
    setSequence(SequenceStatus.SELECT_IMAGE);
  }

  const onSelectImage = () => {
    setSequence(SequenceStatus.INPUT_MESSAGE);
  }

  const onChange = (str: string) => {
    setMessage(str);
  }

  const onInputMessage = () => {
    setSequence(SequenceStatus.CONFIRM);
  }

  const onConfirm = () => {
    /*
    if (!arigatou.instance) return;
    if (!sendUser) return;
    arigatou.instance.transfer(sendUser.address, sendAmount)
      .then((tx: TransactionResponse) => tx.wait())
      .then(async () => {
        if (!arigatou.instance) return;
        setTokenAmount(await arigatou.instance.getCoinBalance());
      })
    //*/
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
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text className="me-5">Point: { String(tokenAmount) } &nbsp;
              <Button variant="info">Purchase</Button>
            </Navbar.Text>
            <Navbar.Text className="me-5">DIT: { String(tokenAmount) } &nbsp;
              <Button variant="info" onClick={ withdraw }>Withdraw</Button>
            </Navbar.Text>
            <Navbar.Text className="me-1">Community:</Navbar.Text>
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
              ? <Button variant="outline-info" className="me-3" disabled>Connected</Button>
              : <Button variant="info" className="me-3" onClick={ join }>Connect</Button>
            }
        </Navbar.Collapse>
      </Navbar>
      <div className="mt-5 pt-5"></div>
      <div>
      <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Receipt</th>
              <th>Send</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user, index) => {
              if (user.address != currentAddress) {
                return (
                  <tr key={index} v-for="user in users">
                    <td>{user.name}</td>
                    <td>{user.address}</td>
                    <td>{String(user.receipt)}</td>
                    <td><Button variant="info" onClick={() => onSelectUser(user)}>Send</Button></td>
                  </tr>
                )
              }
            })}
          </tbody>
        </Table>
      </div>
      <Modal show={sequence == SequenceStatus.SELECT_IMAGE} aria-labelledby="contained-modal-title-vcenter" centered dialogClassName="arigatou_confirm" onHide={onCancelSelectImage}>
        <Modal.Header closeButton>
          <Modal.Title>Send a heart to {sendUser?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Choose a heart! (Possession points: {String(tokenAmount)})</p>
          <CardGroup>
            <Card className="text-center">
              <Card.Img variant="top"  style={{ width: '90%' }} className="arigatou_card mt-3" src="/green.png" />
              <Card.Body>
                <Button variant="info" onClick={() => onSelectImage()}>150 Pts.</Button>
              </Card.Body>
            </Card>
            <Card className="text-center">
              <Card.Img variant="top"  style={{ width: '90%' }} className="arigatou_card mt-3" src="/normal.png" />
              <Card.Body>
                <Button variant="info" onClick={() => onSelectImage()}>300 Pts.</Button>
              </Card.Body>
            </Card>
            <Card className="text-center">
              <Card.Img variant="top"  style={{ width: '90%' }} className="arigatou_card mt-3" src="/kirakira.png" />
              <Card.Body>
                <Button variant="info" onClick={() => onSelectImage()}>450 Pts.</Button>
              </Card.Body>
            </Card>
          </CardGroup>
        </Modal.Body>
      </Modal>
      <Modal show={sequence == SequenceStatus.INPUT_MESSAGE} aria-labelledby="contained-modal-title-vcenter" centered onHide={onCancelSelectImage}>
        <Modal.Header closeButton>
          <Modal.Title>Send a heart to {sendUser?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Let's put a message!</p>
          <Form>
            <Form.Control type="text" onChange={(e) => onChange(e.target.value)} autoFocus />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onCancelInputMessage}>
            Back
          </Button>
          <Button variant="info" onClick={onInputMessage}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={sequence == SequenceStatus.CONFIRM} aria-labelledby="contained-modal-title-vcenter" centered dialogClassName="arigatou_confirm" onHide={onCancelSelectImage}>
        <Modal.Header closeButton>
          <Modal.Title>Send a heart to {sendUser?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Would you like to send this heart?</p>
          <Image className="arigatou_nft" style={{width: '50rem'}} src="/sample_nft.png"></Image>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onCancelConfirm}>
            Back
          </Button>
          <Button variant="info" onClick={onConfirm}>
            Send
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
