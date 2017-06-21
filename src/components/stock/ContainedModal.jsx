import React, { Component } from 'react';
import { Modal, Jumbotron } from 'react-bootstrap';
import './modalContainer.css';


class ContainedModal extends Component {

  expandHeight() {
    document.getElementsByClassName('modal-container')[0].style.height = document.getElementById('chartBox').clientHeight+"px"
  }

  render() {
    debugger
    var modalBody;
    if (window.location.pathname === "/stocks") {
      modalBody = (
        <Modal.Body>
          <h4 style={{ textAlign: "center" }}>{ `Loading data for ${ this.props.symbol } ...` }</h4>
          <div className="spinner-wrapper">
            <div className="spinner">
              <div className="rect2 spinner-rect-margin" />
              <div className="rect3 spinner-rect-margin" />
              <div className="rect4 spinner-rect-margin" />
              <div className="rect5 spinner-rect-margin" />
            </div>
          </div>
        </Modal.Body>
      )
    } else {
      modalBody = (
        <Modal.Body>
          <h4 style={{ textAlign: "center" }}>{ `Loading data for ${ this.props.symbol } ...` }</h4>
          <Jumbotron>
            <div className="spinner-wrapper">
              <div className="spinner">
                <div className="rect2 spinner-rect-margin" />
                <div className="rect3 spinner-rect-margin" />
                <div className="rect4 spinner-rect-margin" />
                <div className="rect5 spinner-rect-margin" />
              </div>
            </div>
          </Jumbotron>
        </Modal.Body>
      )
    }

    return (
      <div className="modal-container">
        <Modal show={ true }
          bsSize="sm"
          container={this}
          onEnter={ this.expandHeight }
          >
          { modalBody }
        </Modal>
      </div>
    )
  }
}

export default ContainedModal;
