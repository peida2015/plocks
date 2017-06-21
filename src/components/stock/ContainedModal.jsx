import React, { Component } from 'react';
import { Modal, Jumbotron } from 'react-bootstrap';
import './modalContainer.css';


class ContainedModal extends Component {

  expandHeight() {
    document.getElementsByClassName('modal-container')[0].style.height = document.getElementById('chartBox').clientHeight+"px"
  }

  render() {
    return (
      <div className="modal-container">
        <Modal show={ true }
          container={this}
          onEnter={ this.expandHeight }>
          <Modal.Body>
            <Modal.Header>
              <h4>{ `Loading data for ${ this.props.symbol }, please wait ...` }</h4>
            </Modal.Header>
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
        </Modal>
      </div>
    )
  }
}

export default ContainedModal;
